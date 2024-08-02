import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewsCard from './NewsCard';
import Pagination from './Pagination';
import styles from './css/NewsCard.module.css';

function News() {
    const [articles, setArticles] = useState([]);
    const [region, setRegion] = useState('서울');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const articlesPerPage = 6;
    const apiKey = 'd6d9128e58c34dd8addd373daf069b1e';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const url = `https://newsapi.org/v2/everything?q=${region}&language=ko&apiKey=${apiKey}`;
            try {
                const response = await axios.get(url, { withCredentials: false }); // 외부 API 요청에서는 withCredentials 사용 안 함
                setArticles(response.data.articles);
            } catch (error) {
                console.error('뉴스를 가져오는 중 오류 발생:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [region]);

    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className={styles.newsContainer}>
            <div className={styles.tabMenu}>
                {['서울', '경기도', '경상도', '강원도', '전라도'].map((regionName) => (
                    <button 
                        key={regionName}
                        className={`${styles.tabButton} ${region === regionName ? styles.active : ''}`}
                        onClick={() => setRegion(regionName)}
                    >
                        {regionName}
                    </button>
                ))}
            </div>
            {loading ? <p>로딩 중...</p> : (
                <div>
                    <div className={styles.newsList}>
                        {currentArticles.map((article, index) => (
                            <NewsCard key={index} article={article} />
                        ))}
                    </div>
                    <Pagination 
                        articlesPerPage={articlesPerPage} 
                        totalArticles={articles.length} 
                        paginate={paginate}
                        currentPage={currentPage}
                    />
                </div>
            )}
        </div>
    );
}

export default News;
