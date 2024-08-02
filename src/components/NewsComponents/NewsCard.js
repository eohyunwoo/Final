import React from 'react';
import styles from './css/NewsCard.module.css'; 

function NewsCard({ article }) {
    return (
        <div className={styles.newsCard}>
            <img src={article.urlToImage} alt={article.title} className={styles.newsImage} />
            <div className={styles.newsContent}>
                <h2 className={styles.newsTitle}>{article.title}</h2>
                <p className={styles.newsDescription}>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.newsLink}>기사 보기</a>
            </div>
        </div>
    );
}

export default NewsCard;
