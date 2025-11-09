from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from utils import generate_random_id
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


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
