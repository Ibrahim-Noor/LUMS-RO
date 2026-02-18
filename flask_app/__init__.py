from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app(test_config=None):
    static_dir = os.path.join(os.getcwd(), 'dist', 'public')
    is_production = os.environ.get('NODE_ENV') == 'production' or os.environ.get('REPL_DEPLOYMENT') == '1'

    if is_production and os.path.isdir(static_dir):
        app = Flask(__name__, static_folder=static_dir, static_url_path='')
        print(f"Production mode: serving static files from {static_dir}", flush=True)
    else:
        app = Flask(__name__, static_folder=None)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', '')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 1800
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    CORS(app, supports_credentials=True, origins=["*"])

    from flask import jsonify

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({'message': 'Missing or invalid token'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401

    from flask_app.routes.auth import auth_bp
    from flask_app.routes.document_requests import doc_bp
    from flask_app.routes.petitions import pet_bp
    from flask_app.routes.major_applications import major_bp
    from flask_app.routes.calendar import cal_bp
    from flask_app.routes.payments import pay_bp
    from flask_app.routes.notifications import notif_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(doc_bp, url_prefix='/api')
    app.register_blueprint(pet_bp, url_prefix='/api')
    app.register_blueprint(major_bp, url_prefix='/api')
    app.register_blueprint(cal_bp, url_prefix='/api')
    app.register_blueprint(pay_bp, url_prefix='/api')
    app.register_blueprint(notif_bp, url_prefix='/api')

    if is_production and os.path.isdir(static_dir):
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve_spa(path):
            file_path = os.path.join(static_dir, path)
            if path and os.path.isfile(file_path):
                return send_from_directory(static_dir, path)
            return send_from_directory(static_dir, 'index.html')

    if not app.config.get('TESTING'):
        with app.app_context():
            from flask_app.seed import seed_data
            seed_data()

    return app
