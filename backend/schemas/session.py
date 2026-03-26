from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class SessionStart(BaseModel):
    user_id: uuid.UUID

class SessionStartResponse(BaseModel):
    session_id: uuid.UUID
    first_question: str
    question_category: str

class BehavioralMetadata(BaseModel):
    deleted_segments: List[str] = []
    keystroke_timestamps: List[int] = []
    edit_count: int = 0
    hedge_word_count: int = 0
    typing_latency_ms: List[int] = []

class AnswerSubmit(BaseModel):
    session_id: uuid.UUID
    question_text: str
    question_category: str
    answer_text: str
    behavioral_metadata: Optional[BehavioralMetadata] = None
    audio_features: Optional[Dict[str, Any]] = None

class AnswerResponse(BaseModel):
    next_question: Optional[str]
    next_question_category: Optional[str]
    interview_complete: bool
    current_depth: int
    progress_pct: float

class RiskOutput(BaseModel):
    session_id: uuid.UUID
    risk_tier: str
    risk_score: float
    top_conditions: List[Dict[str, Any]]
    reasoning_chain: List[str]
    behavioral_flags: List[str]
    recommended_action: str
    trajectory_label: Optional[str]
    trajectory_score: Optional[float]

class SessionHistoryItem(BaseModel):
    session_id: uuid.UUID
    created_at: datetime
    risk_tier: Optional[str]
    top_condition: Optional[str]
    status: str

class PopulationReport(BaseModel):
    region: str
    city: str
    symptom_category: str
