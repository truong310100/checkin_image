// Main JavaScript file for Face Attendance System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Add animations to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Add loading states to buttons
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
                submitBtn.disabled = true;

                // Re-enable button after 10 seconds as failsafe
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 10000);
            }
        });
    });

    // Format time displays
    const timeDisplays = document.querySelectorAll('.time-display');
    timeDisplays.forEach(display => {
        const time = display.textContent;
        if (time && time.includes(':')) {
            display.innerHTML = `<i class="fas fa-clock me-1"></i>${time}`;
        }
    });

    // Add copy to clipboard functionality
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const target = document.querySelector(this.dataset.target);
            if (target) {
                navigator.clipboard.writeText(target.textContent).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check me-1"></i>Đã sao chép';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                });
            }
        });
    });
});

// Utility functions
const Utils = {
    // Format date to Vietnamese format
    formatDate: function(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return new Date(date).toLocaleDateString('vi-VN', options);
    },

    // Format time to Vietnamese format
    formatTime: function(time) {
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    },

    // Validate email format
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Calculate working hours
    calculateWorkingHours: function(checkIn, checkOut) {
        if (!checkIn || !checkOut) return null;
        
        const start = new Date(`1970-01-01T${checkIn}`);
        const end = new Date(`1970-01-01T${checkOut}`);
        const diff = end - start;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return { hours, minutes };
    },

    // Check if browser supports required features
    checkBrowserSupport: function() {
        const required = [
            'navigator.mediaDevices',
            'navigator.mediaDevices.getUserMedia',
            'HTMLCanvasElement',
            'FileReader'
        ];
        
        const missing = required.filter(feature => {
            const parts = feature.split('.');
            let obj = window;
            for (const part of parts) {
                if (!obj[part]) return true;
                obj = obj[part];
            }
            return false;
        });
        
        if (missing.length > 0) {
            this.showNotification(
                'Trình duyệt của bạn không hỗ trợ đầy đủ các tính năng cần thiết. Vui lòng sử dụng Chrome, Firefox hoặc Safari phiên bản mới nhất.',
                'warning'
            );
            return false;
        }
        
        return true;
    }
};

// Camera utilities
const CameraUtils = {
    // Check camera permissions
    checkCameraPermission: async function() {
        try {
            const permissions = await navigator.permissions.query({ name: 'camera' });
            return permissions.state;
        } catch (error) {
            console.warn('Cannot check camera permission:', error);
            return 'unknown';
        }
    },

    // Get available cameras
    getAvailableCameras: async function() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    },

    // Stop all video tracks
    stopAllVideoTracks: function(stream) {
        if (stream) {
            stream.getTracks().forEach(track => {
                if (track.kind === 'video') {
                    track.stop();
                }
            });
        }
    }
};

// Form validation utilities
const FormValidation = {
    // Validate registration form
    validateRegistrationForm: function(formData) {
        const errors = [];
        
        if (!formData.get('name') || formData.get('name').trim().length < 2) {
            errors.push('Tên phải có ít nhất 2 ký tự');
        }
        
        if (!formData.get('email') || !Utils.validateEmail(formData.get('email'))) {
            errors.push('Email không hợp lệ');
        }
        
        if (!formData.get('employee_id') || formData.get('employee_id').trim().length < 3) {
            errors.push('Mã sinh viên phải có ít nhất 3 ký tự');
        }
        
        if (!formData.get('image_data')) {
            errors.push('Vui lòng chụp ảnh khuôn mặt');
        }
        
        return errors;
    }
};

// Export utilities for use in other scripts
window.Utils = Utils;
window.CameraUtils = CameraUtils;
window.FormValidation = FormValidation;