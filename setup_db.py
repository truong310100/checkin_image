#!/usr/bin/env python3
"""
Script to create MySQL database for the Face Attendance System
"""

import pymysql
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv('HOST', 'localhost')
DB_USER = os.getenv('USER_DB', 'root')
DB_PASSWORD = os.getenv('PASSWORD', '')
DB_NAME = os.getenv('DB', 'checkin')

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL server (without specifying database)
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Create database if not exists
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ Database '{DB_NAME}' created successfully!")
            
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        print("Please check your MySQL connection settings in .env file")
        return False

def test_connection():
    """Test connection to the database"""
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT VERSION()")
            version = cursor.fetchone()
            print(f"✅ Successfully connected to MySQL {version[0]}")
            
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔧 Setting up MySQL database for Face Attendance System...")
    print(f"📊 Database details:")
    print(f"   Host: {DB_HOST}")
    print(f"   User: {DB_USER}")
    print(f"   Database: {DB_NAME}")
    print()
    
    # Create database
    if create_database():
        # Test connection
        if test_connection():
            print("🎉 Database setup completed successfully!")
            print("You can now run: python app.py")
        else:
            print("⚠️  Database created but connection test failed")
    else:
        print("💥 Database setup failed!")
        print("\nTroubleshooting tips:")
        print("1. Make sure MySQL server is running")
        print("2. Check your credentials in .env file")
        print("3. Ensure the MySQL user has CREATE DATABASE privileges")