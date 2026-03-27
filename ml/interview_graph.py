import random
from typing import Dict, Any, Optional, List
from .nlp_pipeline import extract_symptoms, MEDICAL_TERMS
from .bayesian_engine import _compute_scores, DB_PATH
import sqlite3

TOTAL_QUESTIONS = 50  # Allow up to 50 questions, providing unlimited drill down

def get_first_question() -> Dict[str, Any]:
    return {
        "question": "How would you describe how you have been feeling overall?",
        "category": "general",
        "depth": 0,
        "branch": "dynamic",
        "total_questions": TOTAL_QUESTIONS,
    }

def get_next_question(
    combined_text: str,
    depth: int,
    asked_symptoms: Optional[List[str]] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Algorithmic Differential Diagnosis:
    Evaluates current symptom text, runs inference, finds top candidates,
    and identifies the highest-probablity symptom the patient HAS NOT mentioned yet
    to ask a highly targeted next question.
    """
    
    # 1. Extract what we know so far
    nlp = extract_symptoms(combined_text)
    icd10_codes = [s["icd10_code"] for s in nlp["symptoms"]]
    
    if depth >= TOTAL_QUESTIONS:
        return {
            "question": None,
            "category": None,
            "depth": depth,
            "branch": "dynamic",
            "total_questions": TOTAL_QUESTIONS,
            "interview_complete": True,
        }
        
    # 2. If no symptoms detected yet, ask a probing general question
    if not icd10_codes:
        probing = [
            "Could you tell me a little more about how you're feeling?", 
            "When did this first start?", 
            "Are there any specific areas that hurt or feel uncomfortable?"
        ]
        return {
            "question": random.choice(probing),
            "category": "general",
            "depth": depth,
            "branch": "dynamic",
            "total_questions": TOTAL_QUESTIONS,
            "interview_complete": False,
        }

    # 3. Use the Bayesian Knowledge Base to find the top suspected conditions
    condition_scores = _compute_scores(icd10_codes, 0.5)
    
    if condition_scores:
        top_condition = condition_scores[0]
        # Stop early if we have extremely high confidence and have asked at least a few questions
        if top_condition["confidence"] > 0.85 and depth > 4:
            return {
                "question": None,
                "category": None,
                "depth": depth,
                "branch": "dynamic",
                "total_questions": TOTAL_QUESTIONS,
                "interview_complete": True,
            }
            
        # Differential extraction: Look at top 3 conditions
        candidates = condition_scores[:3]
        
        candidate_symptoms = {}
        asked = asked_symptoms or []
        
        # Connect to SQLite dynamically to find distinguishing symptoms for the top 3 candidates
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        for cand in candidates:
            # Query the database for the symptoms belonging to this ICD-10 variant
            cursor.execute("""
                SELECT symptom_code, probability 
                FROM condition_symptoms
                WHERE condition_id = (SELECT id FROM conditions WHERE icd10 = ? LIMIT 1)
            """, (cand["icd10"],))
            sym_rows = cursor.fetchall()
            
            if sym_rows:
                for row in sym_rows:
                    sym_code = row["symptom_code"]
                    prob = row["probability"]
                    # Filter out symptoms user holds AND symptoms we ALREADY asked about!
                    if sym_code not in icd10_codes and sym_code not in asked:
                        # Weight it by the condition's current confidence
                        candidate_symptoms[sym_code] = candidate_symptoms.get(sym_code, 0) + (prob * cand["confidence"])
        
        conn.close()
                        
        if candidate_symptoms:
            # Pick the symptom that provides the most information gain
            best_symptom_code = max(candidate_symptoms.items(), key=lambda x: x[1])[0]
            
            # Map code to human readable term
            term = "that"
            for t in MEDICAL_TERMS:
                if t["icd10"] == best_symptom_code:
                    term = t["term"]
                    break
                    
            question = f"Have you been experiencing any {term} recently?"
            return {
                "question": question,
                "category": term,
                "depth": depth,
                "branch": "dynamic",
                "total_questions": TOTAL_QUESTIONS,
                "interview_complete": False,
                "symptom_code": best_symptom_code,
            }
            
    # Fallback
    fallback = [
        "Is there anything else you've noticed?", 
        "Does anything make the symptoms better or worse?", 
        "How much is this affecting your daily routine?"
    ]
    chosen = random.choice(fallback)
    
    response = {
        "question": chosen,
        "category": "severity" if "affecting" in chosen else "general",
        "depth": depth,
        "branch": "dynamic",
        "total_questions": TOTAL_QUESTIONS,
        "interview_complete": False,
    }
    
    if "affecting" in chosen:
        response["options"] = [{"value": str(i), "label": f"{i}/10"} for i in range(1, 11)]
        
    return response

if __name__ == "__main__":
    print(get_next_question("my stomach hurts", 1))
    print(get_next_question("my stomach hurts and I am nauseous", 2))
