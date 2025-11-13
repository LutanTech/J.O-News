from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from utils import generate_random_id
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.String(10), primary_key=True, default=generate_random_id)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(100))
    username = db.Column(db.String(50))
    otp = db.Column(db.String(10), nullable=True)
    verified = db.Column(db.Boolean, default=False)
    pic = db.Column(db.String(255), nullable=False)
    password = db.Column(db.Text, nullable=True)
    login_method = db.Column(db.String(50), default='email')
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    joined = db.Column(db.DateTime, default=lambda:datetime.utcnow() + timedelta(hours=3), nullable=True)
    device = db.Column(db.Text, nullable=True, default='Unknown')
    level = db.Column(db.Text, nullable=True, default='Beginner')
    location = db.Column(db.Text, nullable=True, default='Nairobi, Kenya')
    followers = db.Column(db.Integer, nullable=True, default=0)
    following = db.Column(db.Integer, nullable=True, default=0)
    bio = db.Column(db.Text, nullable=True)
    phone = db.Column(db.String(13), nullable=True)
    tiktok = db.Column(db.Text, nullable=True)
    ig = db.Column(db.Text, nullable=True)
    facebook = db.Column(db.Text, nullable=True)
    x = db.Column(db.Text, nullable=True)


    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "username": self.username,
            "pic": self.pic,
            "verified": self.verified,
            "login_method": self.login_method,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            'joined':self.joined,
            'device':self.device,
            'level':self.level,
        }
    def to_small_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "username": self.username,
            "pic": self.pic,
            "verified": self.verified,
            "login_method": self.login_method,
            "is_active": self.is_active,
            'joined':self.joined,
            'level':self.level,

        }
    def to_disp_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "username": self.username,
            "pic": self.pic,
            "is_active": self.is_active,
            "joined": self.joined,
            "level": self.level,
            "verified": self.verified,
            "location": self.location,
            "followers": self.followers,
            "following": self.following,
            "bio": self.bio,
            "phone": self.phone,
            "tiktok": self.tiktok,
            "ig": self.ig,
            "facebook": self.facebook,
            "x": self.x,  
        }


class News(db.Model):
    id = db.Column(db.String(10), primary_key=True)
    title = db.Column(db.Text, nullable=False)
    slug = db.Column(db.Text, nullable=False)
    categ = db.Column(db.String(255), nullable=False)
    sub = db.Column(db.String(255), nullable=False)
    is_trending = db.Column(db.Boolean, default=True)
    content = db.Column(db.Text, nullable=False)
    added = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=3))
    image_url = db.Column(db.String(500), nullable=True)
    views = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)
    shares = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "categ": self.categ,
            "sub": self.sub,
            "is_trending": self.is_trending,
            "content": self.content,
            "shares": self.shares,
            "likes": self.likes,
            "views": self.views,
            "image_url": self.image_url,
            "added": self.added.isoformat(),
        }

    def to_small_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content or "",
            "image_url": self.image_url,
            "added": self.added.isoformat(),
            "slug":self.slug
        }

    def to_disp_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content or "",
            "categ": self.categ,
            "sub": self.sub,
            "image_url": self.image_url,
            "shares": self.shares,
            "likes": self.likes,
            "views": self.views,
            "added": self.added.isoformat()
        }

class Log(db.Model):
   id = db.Column(db.String(6), primary_key=True)
   type = db.Column(db.String(20))
   content = db.Column(db.Text)

class Comment(db.Model):
    id = db.Column(db.String, primary_key=True, default=lambda: generate_random_id(10))
    user_id = db.Column(db.String(10), db.ForeignKey('user.id'), nullable=False)
    at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=3))
    content = db.Column(db.Text, nullable=False)
    article = db.Column(db.String(10), db.ForeignKey('news.id'), nullable=False)
    dislikes = db.Column(db.Integer, default=0)
    likes = db.Column(db.Integer, default=0)


    def to_dict(self):
        user = User.query.filter_by(id=self.user_id).first()
        return {
            "id": self.id,
            "a_id": self.article,
            "user": user if user else 'None',
            "user_id": self.user_id,
            "content": self.content,
            "at": self.at.isoformat(), 
            'likes':self.likes,
            'dislikes':self.dislikes
        }