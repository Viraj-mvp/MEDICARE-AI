export interface Symptom {
    id: string;
    name: string;
    category: string;
    icon: string;
    description: string;
}

export const symptoms: Symptom[] = [
    // Head & Neurological
    { id: "headache", name: "Headache", category: "Head", icon: "🤕", description: "Pain in the head or upper neck" },
    { id: "dizziness", name: "Dizziness", category: "Head", icon: "😵", description: "Feeling faint or unsteady" },
    { id: "migraine", name: "Migraine", category: "Head", icon: "⚡", description: "Severe throbbing headache" },
    { id: "confusion", name: "Confusion", category: "Neurological", icon: "🤔", description: "Difficulty thinking clearly" },
    { id: "memory_loss", name: "Memory Loss", category: "Neurological", icon: "🧠", description: "Trouble remembering things" },
    { id: "numbness", name: "Numbness", category: "Neurological", icon: "✋", description: "Loss of sensation" },
    { id: "tingling", name: "Tingling", category: "Neurological", icon: "⚡", description: "Pins and needles sensation" },

    // Respiratory
    { id: "cough", name: "Cough", category: "Respiratory", icon: "😷", description: "Persistent coughing" },
    { id: "shortness_breath", name: "Shortness of Breath", category: "Respiratory", icon: "😮💨", description: "Difficulty breathing" },
    { id: "wheezing", name: "Wheezing", category: "Respiratory", icon: "🌬️", description: "Whistling sound when breathing" },
    { id: "chest_pain", name: "Chest Pain", category: "Respiratory", icon: "💔", description: "Pain in the chest area" },
    { id: "sore_throat", name: "Sore Throat", category: "Respiratory", icon: "🗣️", description: "Pain or irritation in throat" },
    { id: "runny_nose", name: "Runny Nose", category: "Respiratory", icon: "🤧", description: "Nasal discharge" },
    { id: "congestion", name: "Congestion", category: "Respiratory", icon: "👃", description: "Blocked nasal passages" },

    // Digestive
    { id: "nausea", name: "Nausea", category: "Digestive", icon: "🤢", description: "Feeling sick to stomach" },
    { id: "vomiting", name: "Vomiting", category: "Digestive", icon: "🤮", description: "Throwing up" },
    { id: "diarrhea", name: "Diarrhea", category: "Digestive", icon: "💩", description: "Loose or watery stools" },
    { id: "constipation", name: "Constipation", category: "Digestive", icon: "😣", description: "Difficulty passing stools" },
    { id: "bloating", name: "Bloating", category: "Digestive", icon: "🎈", description: "Feeling of fullness" },
    { id: "abdominal_pain", name: "Abdominal Pain", category: "Digestive", icon: "🤰", description: "Stomach or belly pain" },
    { id: "heartburn", name: "Heartburn", category: "Digestive", icon: "🔥", description: "Burning sensation in chest" },
    { id: "loss_appetite", name: "Loss of Appetite", category: "Digestive", icon: "🍽️", description: "Reduced desire to eat" },

    // General
    { id: "fever", name: "Fever", category: "General", icon: "🤒", description: "Elevated body temperature" },
    { id: "fatigue", name: "Fatigue", category: "General", icon: "😴", description: "Extreme tiredness" },
    { id: "weakness", name: "Weakness", category: "General", icon: "💪", description: "Lack of physical strength" },
    { id: "chills", name: "Chills", category: "General", icon: "🥶", description: "Feeling cold with shivering" },
    { id: "sweating", name: "Sweating", category: "General", icon: "💦", description: "Excessive perspiration" },
    { id: "weight_loss", name: "Weight Loss", category: "General", icon: "⚖️", description: "Unexplained weight decrease" },
    { id: "weight_gain", name: "Weight Gain", category: "General", icon: "📈", description: "Unexplained weight increase" },
    { id: "dehydration", name: "Dehydration", category: "General", icon: "🏜️", description: "Lack of adequate fluids" },

    // Musculoskeletal
    { id: "muscle_pain", name: "Muscle Pain", category: "Musculoskeletal", icon: "💪", description: "Aching in muscles" },
    { id: "joint_pain", name: "Joint Pain", category: "Musculoskeletal", icon: "🦴", description: "Pain in joints" },
    { id: "back_pain", name: "Back Pain", category: "Musculoskeletal", icon: "🔙", description: "Pain in the back" },
    { id: "neck_pain", name: "Neck Pain", category: "Musculoskeletal", icon: "🦒", description: "Pain in the neck" },
    { id: "stiffness", name: "Stiffness", category: "Musculoskeletal", icon: "🧱", description: "Difficulty moving joints" },
    { id: "swelling", name: "Swelling", category: "Musculoskeletal", icon: "🎈", description: "Enlarged body parts" },
    { id: "cramps", name: "Muscle Cramps", category: "Musculoskeletal", icon: "⚡", description: "Sudden muscle contractions" },

    // Skin
    { id: "rash", name: "Skin Rash", category: "Skin", icon: "🔴", description: "Skin irritation or discoloration" },
    { id: "itching", name: "Itching", category: "Skin", icon: "🖐️", description: "Urge to scratch skin" },
    { id: "dry_skin", name: "Dry Skin", category: "Skin", icon: "🏜️", description: "Rough or flaky skin" },
    { id: "bruising", name: "Bruising", category: "Skin", icon: "💜", description: "Unexplained bruises" },
    { id: "hives", name: "Hives", category: "Skin", icon: "🔴", description: "Raised, itchy welts" },
    { id: "skin_discoloration", name: "Skin Discoloration", category: "Skin", icon: "🎨", description: "Changes in skin color" },

    // Eyes
    { id: "blurred_vision", name: "Blurred Vision", category: "Eyes", icon: "👁️", description: "Unclear or fuzzy sight" },
    { id: "eye_pain", name: "Eye Pain", category: "Eyes", icon: "👁️🗨️", description: "Discomfort in eyes" },
    { id: "red_eyes", name: "Red Eyes", category: "Eyes", icon: "🔴", description: "Bloodshot appearance" },
    { id: "watery_eyes", name: "Watery Eyes", category: "Eyes", icon: "💧", description: "Excess tear production" },
    { id: "sensitivity_light", name: "Light Sensitivity", category: "Eyes", icon: "☀️", description: "Discomfort from bright light" },

    // Ears
    { id: "ear_pain", name: "Ear Pain", category: "Ears", icon: "👂", description: "Aching in the ear" },
    { id: "hearing_loss", name: "Hearing Loss", category: "Ears", icon: "🔇", description: "Reduced hearing ability" },
    { id: "ringing_ears", name: "Ringing in Ears", category: "Ears", icon: "🔔", description: "Tinnitus" },

    // Cardiovascular
    { id: "palpitations", name: "Heart Palpitations", category: "Cardiovascular", icon: "💓", description: "Racing or irregular heartbeat" },
    { id: "high_blood_pressure", name: "High Blood Pressure", category: "Cardiovascular", icon: "📈", description: "Elevated blood pressure" },
    { id: "low_blood_pressure", name: "Low Blood Pressure", category: "Cardiovascular", icon: "📉", description: "Below normal blood pressure" },
    { id: "chest_tightness", name: "Chest Tightness", category: "Cardiovascular", icon: "😰", description: "Pressure in the chest" },

    // Mental Health
    { id: "anxiety", name: "Anxiety", category: "Mental Health", icon: "😰", description: "Excessive worry or fear" },
    { id: "depression", name: "Depression", category: "Mental Health", icon: "😢", description: "Persistent sadness" },
    { id: "insomnia", name: "Insomnia", category: "Mental Health", icon: "🌙", description: "Difficulty sleeping" },
    { id: "mood_swings", name: "Mood Swings", category: "Mental Health", icon: "🎭", description: "Rapid emotional changes" },
    { id: "irritability", name: "Irritability", category: "Mental Health", icon: "😠", description: "Easily annoyed or angered" },
    { id: "stress", name: "Stress", category: "Mental Health", icon: "😫", description: "Mental or emotional strain" },

    // Urinary
    { id: "frequent_urination", name: "Frequent Urination", category: "Urinary", icon: "🚽", description: "Needing to urinate often" },
    { id: "painful_urination", name: "Painful Urination", category: "Urinary", icon: "😖", description: "Burning during urination" },
    { id: "blood_urine", name: "Blood in Urine", category: "Urinary", icon: "🩸", description: "Red or pink urine" },

    // Other
    { id: "sneezing", name: "Sneezing", category: "Other", icon: "🤧", description: "Sudden nasal expulsion" },
    { id: "hair_loss", name: "Hair Loss", category: "Other", icon: "💇", description: "Unusual hair shedding" },
    { id: "bad_breath", name: "Bad Breath", category: "Other", icon: "💨", description: "Unpleasant mouth odor" },
    { id: "excessive_thirst", name: "Excessive Thirst", category: "Other", icon: "🥤", description: "Constant need to drink" },
];

export const categories = [...new Set(symptoms.map(s => s.category))];
