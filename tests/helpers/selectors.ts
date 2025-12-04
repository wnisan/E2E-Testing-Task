// Селекторы для элементов страницы
export const Selectors = {
    // Навигация
    NAV: 'nav, .navbar',
    LINKS: 'a',
    BUTTONS: 'button',
    
    // Аутентификация
    SIGN_UP: [
        'a[href="/register"]',
        'a[href*="register"]',
        'a.nav-link[href*="register"]'
    ] as const,
    
    LOGIN: [
        'a[href="/login"]',
        'a[href*="login"]'
    ] as const,
    
    LOGOUT: [
        'a[href*="logout"]',
        'button[class*="logout"]',
        '.logout-button'
    ] as const,
    
    // Формы
    FORM: 'form',
    INPUT: 'input',
    TEXTAREA: 'textarea',
    
    // Поля регистрации
    USERNAME_FIELD: [
        'input[placeholder*="Username"]',
        'input[name*="username"]',
        'input[type="text"]:nth-of-type(1)'
    ] as const,
    
    EMAIL_FIELD: [
        'input[placeholder*="Email"]',
        'input[type="email"]',
        'input[name*="email"]'
    ] as const,
    
    PASSWORD_FIELD: [
        'input[placeholder*="Password"]',
        'input[type="password"]',
        'input[name*="password"]'
    ] as const,
    
    SUBMIT_BUTTON: [
        'button[type="submit"]',
        'button.btn-primary',
        'button'
    ] as const,
    
    // Посты
    POST_TITLE_FIELD: [
        'input[placeholder*="Title"]',
        'input[placeholder*="Article Title"]'
    ] as const,
    
    POST_DESCRIPTION_FIELD: [
        'input[placeholder*="about"]',
        'input[placeholder*="What\'s this article about"]'
    ] as const,
    
    POST_BODY_FIELD: [
        'textarea[placeholder*="article"]',
        'textarea[placeholder*="markdown"]',
        'textarea'
    ] as const,
    
    TAG_INPUT: [
        'input[placeholder*="tags"]',
        'input[placeholder*="Enter tags"]'
    ] as const,
    
    PUBLISH_BUTTON: [
        'button[type="submit"]',
        'button.btn-primary',
        'button'
    ] as const, 
    
    // Пользователь
    USER_PROFILE: [
        '.user-pic',
        '.avatar',
        'img.user-pic'
    ] as const, 
    
    USER_SETTINGS: [
        'a[href*="settings"]',
        'a.nav-link[href*="settings"]'
    ] as const,
    
    // Теги и статьи
    TAGS: [
        '.tag-list .tag-pill',
        '.sidebar .tag-default',
        '.tag-list .tag-default'
    ] as const,
    
    ARTICLES: [
        'div.article-preview',
        'article',
        '.article-preview'
    ] as const,
    
    ARTICLE_TITLES: 'div.article-preview h1, article h1, .article-preview h1',
    
    // Ошибки
    ERROR_MESSAGES: [
        '.error-messages',
        '.alert-danger',
        '.text-danger',
        '.error'
    ] as const
} as const;