from gc import get_count
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timedelta

from pydantic_core import Url
import models
from models import News, Log, Comment, User, OTP, Help, Ad, Likes
from flask_mail import Mail, Message
from requests_oauthlib import OAuth2Session
from urllib.parse import urlencode
import base64, json, uuid
from datetime import datetime, timedelta
import string, re
from werkzeug.security import generate_password_hash, check_password_hash
import math
from utils import generate_random_id, make_slug, upload_to_imgbb, remove_punct, generate_otp, generate_token, validate_token
import user_agents
import os, shutil

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///news.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'not_really_a_secret'

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'lutancorpinfoteam@gmail.com'
app.config['MAIL_PASSWORD'] = 'ecpb aukn nagd csqh'
app.config['MAIL_DEFAULT_SENDER'] = ('JOMC News Team', 'lutancorpinfoteam@gmail.com')
app.config['ADMIN_EMAIL'] = 'lutancorpinfoteam@gmail.com'

ALLOWED_FRONTEND_ORIGINS = [
     "http://127.0.0.1:5500",
    "https://jomc-news.vercel.app",
]

CORS(app, origins=ALLOWED_FRONTEND_ORIGINS, supports_credentials=True)
models.db.init_app(app)
db = models.db
migrate = Migrate(app, db)
mail = Mail(app)



from flask import request
import json
import user_agents

def log(content, type):
    try:
        # IP
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)

        ua_string = request.headers.get('User-Agent', '')
        ua = user_agents.parse(ua_string)

        meta = {
            "ip": ip,
            "device_type": "Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "PC",
            "device_model": ua.device.model or "Unknown",
            "device_brand": ua.device.brand or "Unknown",
            "os": ua.os.family or "Unknown",
            "browser": ua.browser.family or "Unknown",
        }

        meta_json = json.dumps(meta)

        new_log = Log(
            id=generate_random_id(6),

            type=type,
            content=content,
            requestor=meta_json
        )

        db.session.add(new_log)
        db.session.commit()
        return True

    except Exception as e:
        db.session.rollback()
        print("error during logging", e)
        return False

def send_otp_email(user_email, otp_code, username=None):
    """
    Sends an OTP email to a user with a clean HTML + plain text fallback.

    Parameters:
        user_email (str): The recipient's email.
        otp_code (str | int): The OTP to send.
        username (str, optional): User's name for personalization.
    """
    try:
        plain_body = (
            f"Hello,\n\n"
            f"Your OTP code for JOMC NEWS is: {otp_code}\n"
            f"Please use this to complete your login or registration.\n\n"
            f"JOMC NEWS Team"
        )

        html_body = f"""
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
        </head>
        <body style="font-family: system-ui; margin:0; padding:0; background:#f4f6fb;">
            <table width="100%" style="max-width:600px; margin:24px auto; background:#0ea5e9; border-radius:12px; color:#fff;">
                <tr>
                    <td style="padding:28px; text-align:center;">
                        <h1 style="margin:0 0 8px;">Your OTP Code</h1>
                        <p style="margin:0 0 18px;">Hello {username if username else ''}, use the code below to verify your account.</p>
                        <div style="background:rgba(255,255,255,0.2); padding:16px; border-radius:8px; margin-bottom:18px; font-size:24px; font-weight:700;">
                            {otp_code}
                        </div>
                        <p style="margin:0; font-size:13px; opacity:0.85; color:white;">This OTP will expire in 3 minutes.<br>— JOMC NEWS Team --</p>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

        msg = Message(
            subject="Your OTP Code for JOMC NEWS",
            recipients=[user_email],
            body=plain_body,
            html=html_body
        )

        mail.send(msg)
        print(f"OTP sent to {user_email}")

    except Exception as e:
        log(f"[400] Email send failed: {e}", 'error')


@app.route('/new', methods=['POST'])
def new():
    # get form text fields
    title = request.form.get('title')
    sub = request.form.get('sub')
    categ = request.form.get('categ')
    trending = request.form.get('trending')
    content = request.form.get('content')
    country = request.form.get('country')
    id = request.form.get('id')

    # get file
    image_file = request.files.get("image")
    image_url = None

    if image_file:
        # convert to base64 for imgbb
        image_file.seek(0)
        image_b64 = base64.b64encode(image_file.read()).decode()
        image_url = upload_to_imgbb(image_b64)

    if not title or not sub or not categ or not content:
        return jsonify({'error': 'Missing fields'}), 400

    if not image_url:
        return jsonify({'error':'Image not Uploaded'}), 400

    if not id:
        return jsonify({'error':'User not initiated properly', 'id':id}), 400

    uploader = User.query.filter_by(id=id).first()

    if not uploader:
        return jsonify({'error':'Data mismatch in request. Please login again'}), 400

    new_post = News(
        id = generate_random_id(),
        image_url = image_url,
        title = title,
        categ = categ,
        country=country,
        sub = sub,
        content = content,
        is_trending = trending == "true",
        user_id=uploader.id
    )

    new_post.slug = make_slug(title)

    try:
        db.session.add(new_post)
        db.session.commit()
        return jsonify({'message': 'posted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(str(e))
        log(f'[500]  DB error in /new route : {str(e)}', 'error')
        return jsonify({'error': 'Failed to Post: Database Error'}), 500


@app.route('/get_news')
def news():
    limit = request.args.get('limit', 5,  type=int)
    offset = request.args.get('offset', 0, type=int)

    news_query = News.query.order_by(News.added.desc())

    if limit:
        news_query = news_query.limit(limit)

    news_query = news_query.offset(offset)

    news_dict = news_query.all()
    log('[200] /news route access', 'info')
    return jsonify({'news': [n.to_small_dict() for n in news_dict]})


@app.route('/get_news_filter/<categ>')
def news_filtered(categ):
    limit = request.args.get('limit', 5,  type=int)
    offset = request.args.get('offset', 0, type=int)
    country = request.args.get('c')

    # Start query
    if country == 'True':
        news_query = News.query.filter_by(country=categ).order_by(News.added.desc())
    else:
        news_query = News.query.filter_by(categ=categ).order_by(News.added.desc())

    # Apply offset and limit
    if offset:
        news_query = news_query.offset(offset)
    if limit:
        news_query = news_query.limit(limit)

    # Execute query
    news_list = news_query.all()

    return jsonify({'news': [n.to_small_dict() for n in news_list]})

@app.route('/most_read_filter/<categ>')
def get_most_read_filter(categ):
    limit = request.args.get('limit', 5,  type=int)
    offset = request.args.get('offset', 0, type=int)
    country = request.args.get('c')

    # Start query
    if country == 'True':
        news_query = News.query.filter_by(country=categ).order_by(News.added.desc())
    else:
        news_query = News.query.filter_by(categ=categ).order_by(News.added.desc())

    if offset:
        news_query = news_query.offset(offset)
    if limit:
        news_query = news_query.limit(limit)

    news_list = news_query.all()
    return jsonify({'news': [n.to_small_dict() for n in news_list]})


@app.route('/trending_filter/<categ>')
def get_trending_filter(categ):
    limit = request.args.get('limit', 5,  type=int)
    offset = request.args.get('offset', 0, type=int)

    country = request.args.get('c')

    # Start query
    if country == 'True':
        news_query = News.query.filter_by(country=categ).order_by(News.added.desc())
    else:
        news_query = News.query.filter_by(categ=categ).order_by(News.added.desc())

    if offset:
        news_query = news_query.offset(offset)
    if limit:
        news_query = news_query.limit(limit)

    news_list = news_query.all()
    return jsonify({'news': [n.to_small_dict() for n in news_list]})



@app.route('/most_read')
def mostReadNews():
    news_dict = News.query.order_by(News.views.desc()).limit(6).all()
    return jsonify({'news': [n.to_small_dict() for n in news_dict]})


@app.route('/trending')
def trendingNews():
    news_dict = News.query.filter_by(is_trending=True).order_by(News.added.desc()).limit(6).all()
    return jsonify({'news': [n.to_small_dict() for n in news_dict]})

@app.route('/get/<slug>')
def get_article(slug):
    article = News.query.filter_by(slug=slug).first()
    if article:
        article.views = int(article.views) + 1
        db.session.commit()
        return jsonify({'news':article.to_disp_dict()}), 200
    return jsonify({'error':'Not found'}), 400

from sqlalchemy import func


@app.route('/get_tags')
def get_tags():
    tag = request.args.get('c')
    sub = request.args.get('s')
    limit = 10
    tags = []

    if tag:
        main_query = (
            db.session.query(News.categ, func.count(News.id).label('count'))
            .filter(News.categ.ilike(f"%{tag}%"))
            .group_by(News.categ)
            .order_by(func.count(News.id).desc())
            .limit(limit)
            .all()
        )
        tags = [t[0] for t in main_query]

    # Step 2: fill from sub if less than limit
    if len(tags) < limit and sub:
        remaining = limit - len(tags)
        sub_query = (
            db.session.query(News.categ, func.count(News.id).label('count'))
            .filter(News.sub.ilike(f"%{sub}%"))
            .group_by(News.categ)
            .order_by(func.count(News.id).desc())
            .limit(remaining)
            .all()
        )
        tags += [t[0] for t in sub_query if t[0] not in tags]

    # Step 3: fill from all categories if still less than limit
    if len(tags) < limit:
        remaining = limit - len(tags)
        all_query = (
            db.session.query(News.categ, func.count(News.id).label('count'))
            .group_by(News.categ)
            .order_by(func.count(News.id).desc())
            .limit(remaining)
            .all()
        )
        tags += [t[0] for t in all_query if t[0] not in tags]

    return jsonify({'tags': tags}), 200

@app.route("/search")
def search_articles():
    q = request.args.get("q", "", type=str).strip()
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 20, type=int)

    if not q:
        return jsonify({
            "status": "error",
            "message": "Search term missing"
        }), 400

    query = News.query.filter(
        News.title.ilike(f"%{q}%") |
        News.content.ilike(f"%{q}%") |
        News.categ.ilike(f"%{q}%") |
        News.sub.ilike(f"%{q}%")
    )

    total = query.count()
    results = query.order_by(News.added.desc()) \
        .offset((page - 1) * limit) \
        .limit(limit) \
        .all()

    data = []
    for a in results:
        data.append(a.to_disp_dict())

    total_pages = (total + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1

    return jsonify({
        "status": "success",
        "query": q,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev,
        "news": data
    }), 200


# comment

@app.route('/comment', methods=['POST'])
def comment():
    data = request.get_json()
    print(data)
    user_id = data.get('uid', 'Anonymous')
    a_id = data.get('c_id')
    print(data.get('c_id'))
    content = data.get('content')

    if user_id:
        user = User.query.filter_by(id=user_id).first()
        if user:
          if a_id:
             if content:
                try:
                    new_comment = Comment(user_id=user_id, article=a_id, content=content)
                    db.session.add(new_comment)
                    db.session.commit()
                    return jsonify({'message': '✔'}), 200
                except Exception as e:
                    log(f'[500]  DB error in /comment route : {str(e)}')
                    return jsonify({'error':f'Database error {str(e)}'}), 500


             return jsonify({'error': 'Missing comment text'}), 400
          return jsonify({'error': 'Missing data in request'}), 400
        return jsonify({'error': 'Invalid user. Please login before commenting'}), 400
    return jsonify({'error': 'Missing data. Please login before commenting'}), 400


@app.route('/get_comments')
def comments():
    article_id = request.args.get('id')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    if not article_id:
        return jsonify({'error': 'Article ID missing'}), 400

    article = News.query.filter_by(id=article_id).first()
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    paginated = Comment.query.filter_by(article=article.id) \
        .order_by(Comment.at.desc()) \
        .paginate(page=page, per_page=per_page, error_out=False)

    comments = paginated.items
    total_comments = Comment.query.filter_by(article=article.id).count()

    if not comments:
        return jsonify({
            'msg': 'No comments yet',
            'comments': [],
            'page': page,
            'per_page': per_page,
            'total_pages': 1,
            'total_comments': total_comments
        }), 200

    return jsonify({
        'comments': [c.to_dict() for c in comments],
        'page': page,
        'per_page': per_page,
        'total_pages': paginated.pages,
        'total_comments': total_comments
    }), 200



@app.route('/send-otp', methods=['POST'])
def send_otp_route():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    otp = generate_otp(6)
    existing = OTP.query.filter_by(email=email).first()
    now = datetime.utcnow()  # keep UTC

    if existing and (now - existing.generated) < timedelta(minutes=3):
        return jsonify({'success': False, 'message': 'Please wait before requesting a new OTP'}), 400

    try:
        new_otp = OTP(email=email, otp=otp, id=generate_random_id(6), generated=now)
        db.session.add(new_otp)
        db.session.commit()

        try:
            send_otp_email(email, otp)
            return jsonify({'success': True, 'message': 'OTP sent successfully'})
        except Exception as e:
            log(f"400 : Error in  /send-otp route: {str(e)}", 'error')
            return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500

    except Exception as e:
        db.session.rollback()
        print(f"DB Error: {e}")
        return jsonify({'success': False, 'message': 'Failed to send OTP'}), 500

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if data:
        email = data.get('email')
        username = data.get('username')
        password=data.get('password')
        otp = data.get('otp')

        if email and username and password:
            otpEntry = OTP.query.filter_by(email=email).first()
            if otpEntry:
                savedOtp = int(otpEntry.otp)
                if int(otp) != savedOtp:
                    return jsonify({'error':'OTP mismatch'}), 400
                try:
                    existing = User.query.filter_by(email=email).first()
                    if existing:
                        return jsonify({'error':'Email already registered'}), 400
                    existing_usn = User.query.filter_by(username=username).first()
                    if existing_usn:
                        return jsonify({'error':'Please choose a new username'}), 400

                    new_user = User(email=email, username=username, password=generate_password_hash(password), pic='https://i.ibb.co/HfDsDYb9/default.png')
                    db.session.add(new_user)
                    new_user.verified = True
                    db.session.delete(otpEntry)
                    db.session.commit()
                    log(f'200: New User : {new_user}', 'success')
                    return jsonify({'message','Registration successfull'}), 200
                except Exception as e:
                    log(f'[500]  DB error in /register route : {str(e)}', 'error')
                    return jsonify({'error':f'Database Error {str(e)}'}), 500
            return jsonify({'error':'Please Request a new OTP'}), 400

        return jsonify({'error':'Missing data in request'}), 404
    else:
      return jsonify({'error':'Missing data in request', 'data':data}), 404


from werkzeug.security import check_password_hash

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error':'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error':'Account with that email not found'}), 401

    if not check_password_hash(user.password, password):
        return jsonify({'error':'Incorrect credentials'}), 401

    token = generate_token(user.id)
    return jsonify({'user': user.to_disp_dict(), 'token': token}), 200

@app.route('/ping/account')
def ping_acount():
    id = request.args.get('id')
    token = request.args.get('token')
    if id and token:
        user = User.query.filter_by(id=id).first()
        if user:
             if validate_token(token, user.id):
                return jsonify({'message':'validated', 'user':user.to_disp_dict(),'token':generate_token(user.id)}), 200
             return jsonify({'error':'Unauthorized. Please login again'}), 401
        return jsonify({'error':'Account not found'}), 404
    return jsonify({'error':'Missing data in request. Please login again'}), 400


@app.route('/update', methods=['POST'])
def update():
    data = request.get_json()
    new_url = data.get('link')
    target = data.get('target')

    user_id = request.args.get('id')
    token = request.args.get('token')

    if not (user_id and token and target and new_url):
        return jsonify({'error': 'Missing data, please login again'}), 400

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'Account not found'}), 404

    if not validate_token(token, user.id):
        return jsonify({'error': 'Unauthorized, please login again'}), 401

    allowed_targets = {
        'facebook': 'facebook',
        'x': 'x',
        'ig': 'ig',
        'tiktok': 'tiktok',
        'phone' : 'phone'
    }

    if target not in allowed_targets:
        log('[400] : Invalid target recorded in /update route', 'error')

        return jsonify({'error': 'Invalid target'}), 400

    try:
        field = allowed_targets[target]
        setattr(user, field, new_url)
        db.session.commit()
        return jsonify({'message': 'Update successful'}), 200
    except Exception as e:
        log(f'[500] DB error in /update route : {str(e)}', 'error')
        return jsonify({'error': f'Database error: {str(e)}'}), 500


from sqlalchemy import func

@app.route('/get_user_articles', methods=['GET'])
def get_user_articles():
    user_id = request.args.get('id')
    token = request.args.get('token')
    date_from = request.args.get('from')
    date_to = request.args.get('to')
    categ = request.args.get('category')

    # Pagination params
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    offset = (page - 1) * limit

    if not (user_id and token and date_from and date_to):
        return jsonify({'error': 'Missing fields'}), 400

    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not validate_token(token, user.id):
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        start_date = datetime.strptime(date_from, "%Y-%m-%d").replace(hour=0, minute=0, second=0)
        end_date = datetime.strptime(date_to, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
    except:
        return jsonify({'error': 'Invalid date format'}), 400

    # Base query filtered by user & date
    q = News.query.filter(
        News.added >= start_date,
        News.added <= end_date,
        News.user_id == user.id
    )

    if categ and categ.strip() != "":
        q = q.filter_by(categ=categ)

    total_count = q.count()
    articles = q.order_by(News.added.desc()).offset(offset).limit(limit).all()

    # Only categories that this user has posted to (in given range)
    cat_counts = (
    db.session.query(News.categ, func.count(News.id))
    .filter(News.user_id == user.id)
    .group_by(News.categ)
    .all())

    # convert to list of dicts
    categories_summary = [{'name': cat, 'count': count} for cat, count in cat_counts]

    total_pages = math.ceil(total_count / limit)  # compute total pages

    return jsonify({
        'count': total_count,
        'page': page,
        'limit': limit,
        'total_pages': total_pages,
        'has_next': (page * limit) < total_count,
        'has_prev': page > 1,
        'articles': [a.to_disp_dict() for a in articles],
        'categories_summary': categories_summary
    }), 200

# --------------------- ADMIN ROUTES ---------------------

def is_admin(user):
    return user.email == app.config['ADMIN_EMAIL']


# GET all users
@app.route('/admin/users', methods=['GET'])
def admin_get_users():
    user_id = request.args.get('id')
    token = request.args.get('token')

    user = User.query.filter_by(id=user_id).first()
    if not user or not validate_token(token, user.id) or not is_admin(user):
        log('[401]  Unauthorized Admin Users Access', 'error')

        return jsonify({'error': 'Unauthorized'}), 401

    users = User.query.all()
    log('[200] Admin Users accessed', 'info')
    return jsonify({'users': [u.to_disp_dict() for u in users]}), 200


# DELETE a user
@app.route('/admin/delete_user', methods=['POST'])
def admin_delete_user():
    data = request.get_json()
    admin_id = data.get('admin_id')
    token = data.get('token')
    delete_id = data.get('target_id')

    admin = User.query.filter_by(id=admin_id).first()
    if not admin or not validate_token(token, admin.id) or not is_admin(admin):
        log('[401]  Unauthorized User Delete Access', 'error')

        return jsonify({'error': 'Unauthorized'}), 401

    user = User.query.filter_by(id=delete_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


# GET all articles
@app.route('/admin/articles', methods=['GET'])
def admin_get_articles():
    admin_id = request.args.get('id')
    token = request.args.get('token')

    admin = User.query.filter_by(id=admin_id).first()
    if not admin or not validate_token(token, admin.id) or not is_admin(admin):
        log('[401]  Unauthorized Articles Access', 'error')

        return jsonify({'error': 'Unauthorized'}), 401

    articles = News.query.order_by(News.added.desc()).all()
    return jsonify({'articles': [a.to_disp_dict() for a in articles]}), 200


# DELETE an article
@app.route('/admin/delete_article', methods=['POST'])
def admin_delete_article():
    data = request.get_json()
    admin_id = data.get('admin_id')
    token = data.get('token')
    a_id = data.get('article_id')

    admin = User.query.filter_by(id=admin_id).first()
    if not admin or not validate_token(token, admin.id) or not is_admin(admin):
        log('[401]  Unauthorized Article Delete Access', 'error')

        return jsonify({'error': 'Unauthorized'}), 401

    article = News.query.filter_by(id=a_id).first()
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted'}), 200


# GET all comments
@app.route('/admin/comments', methods=['GET'])
def admin_get_comments():
    admin_id = request.args.get('id')
    token = request.args.get('token')

    admin = User.query.filter_by(id=admin_id).first()
    if not admin or not validate_token(token, admin.id) or not is_admin(admin):
        log('[401] : Unauthorized Comments Access', 'error')
        return jsonify({'error': 'Unauthorized'}), 401

    comments = Comment.query.order_by(Comment.at.desc()).all()
    return jsonify({'comments': [c.to_dict() for c in comments]}), 200


# DELETE a comment
@app.route('/admin/delete_comment', methods=['POST'])
def admin_delete_comment():
    data = request.get_json()
    admin_id = data.get('admin_id')
    token = data.get('token')
    c_id = data.get('comment_id')

    admin = User.query.filter_by(id=admin_id).first()
    if not admin or not validate_token(token, admin.id) or not is_admin(admin):
        log('[401] : Unauthorized Comment Delete Access', 'error')
        return jsonify({'error': 'Unauthorized'}), 401

    comment = Comment.query.filter_by(id=c_id).first()
    if not comment:
        return jsonify({'error': 'Comment not found'}), 404

    db.session.delete(comment)
    db.session.commit()
    return jsonify({'message': 'Comment deleted'}), 200

# --------------------- END ADMIN ROUTES ---------------------

@app.route('/like_comment')
def like_comment():
    id = request.args.get('id')
    uid = request.args.get('uid')
    if id and uid:
        art = Comment.query.filter_by(id=id).first()
        user = User.query.filter_by(id=uid).first()

        try:
            if art:
                if user:
                    exists = Likes.query.filter_by(ref_id=art.id, user_id=user.id).first()
                    if exists:
                      return jsonify({'error':'Already liked'}), 400
                    try:
                        art.likes = int(art.likes) + 1
                        new_like = Likes(ref_id=art.id, user_id=user.id)
                        db.session.add(new_like)
                        db.session.commit()
                        return jsonify({'message':'liked'}), 200
                    except Exception as e:
                        log(f'[500] :  Error in /like_comment route : {str(e)}', 'error')
                        return jsonify({'error':'Failed to like '}), 500
                return jsonify({'error':'Failed to initialize user'}), 400
            return jsonify({'error':'Failed to get comment'}), 400
        except Exception as e:
            log(f'[400]: Error in /like comment > {str(e)}', 'error')
            return jsonify({'error':'failed to like comment'}), 400
    return jsonify({'error':'Missing data in request. Try to log in'}), 404

@app.route('/like_news')
def like_news():
    id = request.args.get('id')
    uid = request.args.get('uid')
    if id and uid:
        art = News.query.filter_by(id=id).first()
        user = User.query.filter_by(id=uid).first()

        try:
            if art:
                if user:
                    exists = Likes.query.filter_by(ref_id=art.id, user_id=user.id).first()
                    if exists:
                       return jsonify({'error':'Already liked'}), 400
                    try:
                        art.likes = int(art.likes) + 1
                        new_like = Likes(ref_id=art.id, user_id=user.id)
                        db.session.add(new_like)
                        db.session.commit()
                        return jsonify({'message':'liked'}), 200
                    except Exception as e:
                        log(f'[500] :  Database error in /like_comment route : {str(e)}', 'error')
                        return jsonify({'error':'Failed to like '}), 500
                return jsonify({'error':'Failed to initialize user'}), 400
            return jsonify({'error':'Failed to get News article'}), 400
        except Exception as e:
            log(f'[400]: Error in /like_news > {str(e)}', 'error')
            return jsonify({'error':'Failed to like news'}), 400
    return jsonify({'error':'Missing data in request. Try to log in'}), 404

@app.route('/dislike_comment')
def dislike_comment():
    id = request.args.get('id')
    comment = Comment.query.filter_by(id=id).first()
    if comment:
        try:
            comment.dislikes = int(comment.dislikes) + 1
            db.session.commit()
            return jsonify({'message':'liked'}), 200
        except Exception as e:
            log(str(e), 'error')
            return jsonify({'error':'Failed to like '}), 500
    return jsonify({'error':'failed'}), 400

@app.route('/like')
def like_art():
    id = request.args.get('id')
    news =News.query.filter_by(id=id).first()
    if news:
        try:
            news.likes = int(news.likes) + 1
            db.session.commit()
            return jsonify({'message':'liked'}), 200
        except Exception as e:
            log(str(e), 'error')
            return jsonify({'error':'Failed to like '}), 500
    return jsonify({'error':'failed'}), 400

@app.route('/get_comment')
def get_comment():
    id = request.args.get('id')
    if id:
        comment = Comment.query.filter_by(id=id).first()
        if comment:
            return jsonify({'comment': comment.to_dict()}), 200
        return jsonify({'error':'missing data in request'}), 400
    return jsonify({'error':'missing data in request'}), 400


@app.route('/help')
def help():
    data = request.get_json()
    if data:
        email = data.get('email')
        text = data.get('description')
        image = data.get('image')
        try:
            new_h = Help(email=email, image=image, text=text)
            db.session.add(new_h)
            db.session.commit()
            return jsonify({'message':'Ticket sent successfully'}), 200
        except Exception as e:
            log(f'[500] : Help Request DB error {str(e)}', 'error')
            db.session.rollback()
            return jsonify({'error':'Database Error'}), 500
    return jsonify({'error':'missing data in request'}), 400

def send_db_backup():
    db_path = os.path.join(app.instance_path, 'news.db')
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_filename = f"news_backup_{timestamp}.db"

    shutil.copy(db_path, backup_filename)

    try:
        msg = Message(
            subject=f"DB Backup {timestamp}",
            recipients=['lutancorpinfoteam@gmail.com'],
            body=f"Hey! Here's your latest JOMC backup."
        )
        with open(backup_filename, 'rb') as f:
            msg.attach(backup_filename, "application/octet-stream", f.read())

        mail.send(msg)
        log(f"[200] : Backed up DB: {backup_filename}", 'success')

        os.remove(backup_filename)

    except Exception as e:
        log(f"[400] : Failed to send backup > {str(e)}", 'error')

@app.route('/backup', methods=['GET'])
def trigger_backup():
    try:
        key = request.args.get('key')
        if key != 'not_yet_set':
            log('[401]: Unauthorized DB backup request', 'error')
            return jsonify({'error': 'Unauthorized'}), 401
        info = send_db_backup()
        return jsonify({'success': 'Backup emailed to you!', 'info':info}), 200
    except Exception as e:
        log(f'[400]: failed to initiate backup > {str(e)}', 'error')
        return jsonify({'error':'failed to initiate backup'}), 400


with app.app_context():
    try:
       db.create_all()
    except Exception as e:
       print(f'Failed to initiate DB {str(e)}')


@app.route('/admin/logs')
def logs():
    prefix = request.args.get('filter')

    if prefix:
        logs = Log.query.filter_by(type=prefix).all()
    else:
        logs = Log.query.all()

    return jsonify({
        'logs': [log.to_dict() for log in logs]
    }), 200


# ------------------------------
#  GET ALL ADS (FILTER OPTIONAL)
# ------------------------------
@app.route('/admin/ads')
def ads():
    try:
        prefix = request.args.get('filter')

        if prefix:
            ads = Ad.query.filter_by(type=prefix).all()
        else:
            ads = Ad.query.all()

        return jsonify({
            'ads': [ad.to_ad_dict() for ad in ads]
        }), 200

    except Exception as e:
        log(f'[400]: Bad Request error in /ads route > {str(e)}', 'error')
        return jsonify({'error': f'route error {str(e)}'}), 400


# ------------------------------
#  GET LATEST ADS (LIMIT OPTIONAL)
# ------------------------------
@app.route('/ads/latest')
def get_latest_ad():
    try:
        limit_val = request.args.get('limit')
        limit_num = int(limit_val) if limit_val else 5
        
        ads = (
            Ad.query
            .filter_by(is_public=True)
            .order_by(Ad.added.desc())
            .limit(limit_num)
            .all()
        )
        
        if ads:
            return jsonify({'ads': [ad.to_dict() for ad in ads]}), 200
        
        return jsonify({'error':'No ads found'}), 404

    except Exception as e:
        log(f'[400]: Error in /ads/latest > {str(e)}', 'error')
        return jsonify({'error': f'Failed: {str(e)}'}), 400
        

from random import sample

@app.route('/get_featured_ads')
def get_featured_ads():
    try:
        limit_val = request.args.get('limit')
        limit_num = int(limit_val) if limit_val else 5

        ads = Ad.query.filter_by(type='featured', is_public=True).all() 

        if not ads:
            return jsonify({'error': 'No Ads added'}), 400

        # pick random ads
        random_ads = sample(ads, min(limit_num, len(ads)))

        return jsonify({'ads': [ad.to_dict() for ad in random_ads]}), 200

    except Exception as e:
        log(f'[400]: Error in /get_featured_ads > {str(e)}', 'error')
        return jsonify({'error': f'Failed: {str(e)}'}), 400



# ------------------------------
#  GET AD BY TITLE AND INCREMENT VIEW COUNT
# ------------------------------
@app.route('/get_ad')
def get_ad():
    try:
        slug = request.args.get('s')
        refined = slug.replace('_', ' ')
        ad = Ad.query.filter_by(title=refined, is_public=True).first()

        if ad:
            ad.seen = int(ad.seen) + 1
            db.session.commit()

            return jsonify({'ad': ad.to_dict()}), 200

        return jsonify({'error': 'ad not found'}), 400

    except Exception as e:
        log(f'[400]: Error in /get_ad > {str(e)}', 'error')
        return jsonify({'error': f'Failed: {str(e)}'}), 400


# ------------------------------
#  ADD NEW AD
# ------------------------------


@app.route('/add_ad', methods=['POST'])
def add_ad():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Missing JSON body'}), 400

        title = data.get('title')
        image = data.get('image_url')
        content = data.get('content')
        valid = data.get('valid')
        t = data.get('type')
        paid = data.get('paid')
        url = data.get('url')

        if not all([title, image, content, valid, type]):
            return jsonify({'error': 'Missing fields'}), 400

        valid_datetime = datetime.fromisoformat(valid.replace("Z", "+00:00"))

        new_ad = Ad(
            title=title,
            image_url=image,
            content=content,
            valid=valid_datetime,
            url=url,
            type=t,
            paid=paid
        )

        db.session.add(new_ad)
        db.session.commit()

        return jsonify({'message': 'Ad added successfully'}), 200

    except Exception as e:
        db.session.rollback()
        log(f'[500] : Database Error in /add_ad route > {str(e)}', 'error')
        return jsonify({'error': f'Failed to add: Database Error: {str(e)}'}), 500


# ------------------------------
#  DELETE AD
# ------------------------------
@app.route('/delete_ad')
def delete_ad():
    try:
        ad_id = request.args.get('id')

        if not ad_id:
            return jsonify({'error': 'Missing id'}), 400

        ad = Ad.query.filter_by(id=ad_id).first()

        if not ad:
            return jsonify({'error': 'Ad not found'}), 404

        db.session.delete(ad)
        db.session.commit()

        return jsonify({'msg': 'deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        log(f'[500] : Database error > {str(e)}', 'error')
        return jsonify({'error': 'Failed to delete ad'}), 500
    
@app.route('/t_ad/<id>')
def toggle(id):
 try:
    if id:
        ad = Ad.query.filter_by(id=id).first()
        if ad:
                try:
                    ad.is_public = not ad.is_public  # toggle visibility
                    db.session.commit()
                    return jsonify({'msg':'Visibility toggled'}), 200
                except Exception as e:
                    db.session.rollback()
                    log(f'[500]: Database error in /toggle ad visibility route > {str(e)}', 'error')
                    return jsonify({'error':'Database error'}), 500

        return jsonify({'error':'Ad not found'}), 404
    return jsonify({'error':'Missing data in request'}), 400
    
 except Exception as e:
        log(f'[500]: Database error in /toggle ad visibility route > {str(e)}', 'error')
        return jsonify({'error':f'Database error'}), 500

@app.route('/v/<id>')
def v(id):
    if id:
        ad = Ad.query.filter_by(id=id).first()
        if ad:
            try:
                ad.seen = int(ad.seen) + 1
                db.session.commit()
                return jsonify({'msg': 'success'}), 200
            except Exception as e:
                log(f'[500]: Database error in /view_ad route > {str(e)}', 'error')
                return jsonify({'error':'Failed to add view'}), 500
        return jsonify({'error':'Failed to get ad'}), 404
    return jsonify({'error':'Missing data in request'}), 400



if __name__ == '__main__':
    print("app.run(debug=True, port=5000, host='0.0.0.0')")
#    app.run(debug=True, port=5000, host='0.0.0.0')
