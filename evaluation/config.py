"""
LLM Evaluation Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'llm_error_db'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}

# LLM Names
LLM_NAMES = [
    'groq',
    'mistral',
    'cohere',
    'openrouter_llama',
    'openrouter_mistral',
    'openrouter_hermes'
]

# Evaluation Weights
WEIGHTS = {
    'technical_accuracy': 0.25,
    'solution_quality': 0.25,
    'clarity': 0.20,
    'conciseness': 0.10,
    'speed': 0.10,
    'reliability': 0.10
}

# Technical Keywords (Turkish + English)
TECHNICAL_KEYWORDS = [
    # English
    'api', 'exception', 'sql', 'timeout', 'connection', 'database',
    'server', 'cache', 'token', 'request', 'response', 'authentication',
    'authorization', 'bug', 'debug', 'log', 'stack trace', 'dependency',
    'module', 'framework', 'library', 'endpoint', 'middleware', 'error',
    'configuration', 'driver', 'session', 'browser', 'element', 'selector',
    'null', 'pointer', 'array', 'index', 'cast', 'argument', 'state',
    'assertion', 'concurrent', 'network', 'socket', 'dns', 'ssl', 'tls',
    'firewall', 'port', 'protocol', 'packet', 'latency', 'bandwidth',
    'memory', 'cpu', 'disk', 'performance', 'query', 'deadlock', 'constraint',
    'csrf', 'xss', 'injection', 'encryption', 'version', 'deprecated',

    # Turkish
    'hata', 'veritabanı', 'sunucu', 'bağlantı', 'zaman aşımı', 'kimlik doğrulama',
    'yetkilendirme', 'günlük', 'modül', 'kütüphane', 'yapılandırma', 'sürücü',
    'tarayıcı', 'oturum', 'dizi', 'bellek', 'işlemci', 'disk', 'performans',
    'sorgu', 'kilitlenme', 'kısıt', 'enjeksiyon', 'şifreleme', 'sürüm'
]

# Solution Keywords
SOLUTION_KEYWORDS = [
    # English
    'solution', 'fix', 'resolve', 'solve', 'repair', 'correct',
    'troubleshoot', 'workaround', 'approach', 'method', 'step',

    # Turkish
    'çözüm', 'düzelt', 'çöz', 'onar', 'yaklaşım', 'yöntem', 'adım'
]

# Cause Keywords
CAUSE_KEYWORDS = [
    # English
    'cause', 'reason', 'because', 'due to', 'root cause', 'origin',

    # Turkish
    'neden', 'sebep', 'çünkü', 'nedeniyle', 'kaynaklı', 'dolayı'
]

# Alternative Keywords
ALTERNATIVE_KEYWORDS = [
    # English
    'alternative', 'another', 'other method', 'different approach',
    'or', 'also', 'additionally',

    # Turkish
    'alternatif', 'başka', 'diğer', 'farklı', 'veya', 'ayrıca', 'ek olarak'
]

# Score Thresholds
WORD_COUNT_OPTIMAL = (300, 800)
WORD_COUNT_ACCEPTABLE = (200, 1000)
WORD_COUNT_POOR = (100, 1500)

RESPONSE_TIME_EXCELLENT = 5000   # ms
RESPONSE_TIME_GOOD = 15000
RESPONSE_TIME_ACCEPTABLE = 30000
