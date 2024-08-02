import React from 'react';
import styles from './css/Pagination.module.css'; // 모듈형 CSS 파일 경로

function Pagination({ articlesPerPage, totalArticles, paginate, currentPage }) {
    const pageNumbers = [];
    const totalPages = Math.ceil(totalArticles / articlesPerPage);
    const maxPageNumbers = 10; 
    const currentPageGroup = Math.ceil(currentPage / maxPageNumbers);

    // 현재 페이지 그룹의 시작과 끝 페이지 번호 계산
    const startPage = (currentPageGroup - 1) * maxPageNumbers + 1;
    const endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <nav>
            <ul className={styles.pagination}>
                {startPage > 1 && (
                    <li className={styles.pageItem}>
                        <a onClick={() => paginate(startPage - maxPageNumbers)} href="#" className={styles.pageLink}>
                            &laquo;
                        </a>
                    </li>
                )}
                {pageNumbers.map(number => (
                    <li key={number} className={`${styles.pageItem} ${currentPage === number ? styles.active : ''}`}>
                        <a onClick={() => paginate(number)} href="#" className={styles.pageLink}>
                            {number}
                        </a>
                    </li>
                ))}
                {endPage < totalPages && (
                    <li className={styles.pageItem}>
                        <a onClick={() => paginate(endPage + 1)} href="#" className={styles.pageLink}>
                            &raquo;
                        </a>
                    </li>
                )}
            </ul>
        </nav>
    );
}

export default Pagination;
