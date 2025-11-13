from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime, timedelta
import models
from models import News, Log, Comment, User
import base64, json, uuid

from utils import generate_random_id, make_slug, upload_to_imgbb, remove_punct, generate_otp, generate_token, validate_token

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///news.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'not_really_a_secret'

CORS(app)
models.db.init_app(app)
db = models.db
migrate = Migrate(app, db)


def log(content, type):
    new_log = Log(id=generate_random_id(6), type=type, content=content)
    try:
        db.session.add(new_log)
        db.session.commit()
        return True
    except Exception as e:
        print('error during logging')
        return False

@app.route('/new', methods=['POST'])
def new():
    # get form text fields
    title = request.form.get('title')
    sub = request.form.get('sub')
    categ = request.form.get('categ')
    trending = request.form.get('trending')
    content = request.form.get('content')

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

    new_post = News(
        id = generate_random_id(),
        image_url = image_url,
        title = title,
        categ = categ,
        sub = sub,
        content = content,
        is_trending = trending == "true"
    )

    new_post.slug = make_slug(title)

    try:
        db.session.add(new_post)
        db.session.commit()
        return jsonify({'message': 'posted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        print(str(e))
        log(str(e), 'error')
        return jsonify({'error': 'Failed to Post: Database Error'}), 500


@app.route('/get_news')
def news():
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', 0, type=int)

    news_query = News.query.order_by(News.added.desc())

    if limit:
        news_query = news_query.limit(limit)

    news_query = news_query.offset(offset)

    news_dict = news_query.all()

    return jsonify({'news': [n.to_small_dict() for n in news_dict]})


@app.route('/get_news_filter/<categ>')
def news_filtered(categ):
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', 0, type=int)

    # Start query
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
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', 0, type=int)

    query = News.query.filter_by(categ=categ).order_by(News.views.desc())
    if offset:
        query = query.offset(offset)
    if limit:
        query = query.limit(limit)

    news_list = query.all()
    return jsonify({'news': [n.to_small_dict() for n in news_list]})


@app.route('/trending_filter/<categ>')
def get_trending_filter(categ):
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', 0, type=int)

    query = News.query.filter_by(categ=categ, is_trending=True).order_by(News.added.desc())
    if offset:
        query = query.offset(offset)
    if limit:
        query = query.limit(limit)

    news_list = query.all()
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
        # article.views = int(article.views) + 1
        # db.session.commit()
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
                new_comment = Comment(user_id=user_id, article=a_id, content=content)
                db.session.add(new_comment)
                db.session.commit()
                return jsonify({'message': '✔'}), 200
             return jsonify({'error': 'Missing content'}), 400
          return jsonify({'error': 'Missing article id'}), 400
        return jsonify({'error': 'Invalid user. Please login before commenting'}), 400
    return jsonify({'error': 'Missing user_id'}), 400


@app.route('/get_comments')
def comments():
    article_id = request.args.get('id')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 5))

    if not article_id:
        return jsonify({'error': 'Article ID missing'}), 400

    article = News.query.filter_by(id=article_id).first()
    if not article:
        return jsonify({'error': 'Article not found'}), 404

    paginated = Comment.query.filter_by(article=article.id).paginate(
        page=page, per_page=per_page, error_out=False
    )

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



with app.app_context():
    db.create_all()

if __name__ == '__main__':
    print("app.run(debug=True, port=5000, host='0.0.0.0')")
    app.run(debug=True, port=50000, host='0.0.0.0')
