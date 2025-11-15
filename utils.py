# app.py
from datetime import datetime, timedelta
import string, secrets, uuid, base64, json, hmac, hashlib, requests
import requests
import re
# -------------------

def generate_random_id(length=8):
    chars = string.ascii_letters + string.digits  
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_otp(length=6):
    chars = string.digits  
    return ''.join(secrets.choice(chars) for _ in range(length))

def generate_token(user_id):
    payload = {
        "id": user_id,
        "exp": (datetime.utcnow() + timedelta(hours=720)).timestamp()
    }
    payload_str = json.dumps(payload)
    sig = hmac.new("not_really_a_secret".encode(), payload_str.encode(), hashlib.sha256).hexdigest()
    token = base64.urlsafe_b64encode(f"{payload_str}::{sig}".encode()).decode()
    return token

def validate_token(token, expected_id):
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        payload_str, sig = decoded.split("::")
        expected_sig = hmac.new("not_really_a_secret".encode(),
                                payload_str.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return False
        data = json.loads(payload_str)
        if data["id"] != expected_id:
            return False
        if datetime.utcnow().timestamp() > data["exp"]:
            return False
        return True
    except Exception:
        return False

IMGBB_API_KEY = "9ff810430da3f1d639d10033e9269f18"

def upload_to_imgbb(image_b64):
    url = "https://api.imgbb.com/1/upload"
    payload = {
        "key": IMGBB_API_KEY,
        "image": image_b64
    }
    response = requests.post(url, data=payload)
    resp_json = response.json()
    if response.status_code == 200 and "data" in resp_json and "url" in resp_json["data"]:
        return resp_json["data"]["url"]
    else:
        raise Exception(f"ImgBB upload failed: {resp_json}")
    
def remove_punct(txt):
    txt = txt.translate(str.maketrans('', '', string.punctuation))
    txt = re.sub(r'[“”‘’–—…•·]', '', txt)
    return txt



def make_slug(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9 ]', '', text)
    return re.sub(r'\s+', '-', text)


