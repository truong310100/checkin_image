"""
Application routes using Blueprints
"""
from flask import Blueprint
from controllers.main_controller import MainController
from controllers.user_controller import UserController
from controllers.attendance_controller import AttendanceController
from controllers.debug_controller import DebugController

# Create blueprints
main_bp = Blueprint('main', __name__)
user_bp = Blueprint('user', __name__, url_prefix='/user')
attendance_bp = Blueprint('attendance', __name__, url_prefix='/attendance')
debug_bp = Blueprint('debug', __name__, url_prefix='/debug')

# Main routes
main_bp.route('/')(MainController.index)
main_bp.route('/debug')(MainController.debug)

# User routes
user_bp.route('/register', methods=['GET'])(UserController.register)
user_bp.route('/register', methods=['POST'])(UserController.register_user)
user_bp.route('/history')(UserController.history)

# Attendance routes
attendance_bp.route('/checkin', methods=['GET'])(AttendanceController.checkin)
attendance_bp.route('/checkin', methods=['POST'])(AttendanceController.process_checkin)
attendance_bp.route('/history/<int:user_id>')(AttendanceController.user_history)

# Debug routes
debug_bp.route('/users')(DebugController.debug_users)
debug_bp.route('/test_recognition', methods=['POST'])(DebugController.test_recognition)

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(main_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(debug_bp)