import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../css/BoardCss/Board.module.css'; // CSS 모듈 import
import { useAuth } from '../../contexts/AuthContext';

// 상태를 세션 스토리지에 저장하는 함수
const saveStateToSession = (state) => {
  sessionStorage.setItem('boardState', JSON.stringify(state));
};

// 세션 스토리지에서 상태를 불러오는 함수
const loadStateFromSession = () => {
  const savedState = sessionStorage.getItem('boardState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return null;
};

export default function Board() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boardList, setBoardList] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]); // 카테고리 상태 추가
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  const savedState = loadStateFromSession();
  const [currentPage, setCurrentPage] = useState(savedState?.currentPage || 1);
  const [selectedCategory, setSelectedCategory] = useState(savedState?.selectedCategory || null);
  const [sortOrder, setSortOrder] = useState(savedState?.sortOrder || 'date');
  const [searchType, setSearchType] = useState(savedState?.searchType || 'title');
  const [searchKeyword, setSearchKeyword] = useState(savedState?.searchKeyword || '');
  const [tempSearchKeyword, setTempSearchKeyword] = useState(searchKeyword);

  useEffect(() => {
    // 페이지가 로드될 때 스크롤을 맨 위로 올립니다.
    window.scrollTo(0, 0);
  }, []);

  const readData = async (pageNo, category, sortOrder, searchType, searchKeyword) => {
    let url;
    if (category === 'popular') {
      url = `http://localhost:9999/board/list?pageNo=${pageNo}&sortOrder=${sortOrder}&searchType=${searchType}&searchKeyword=${searchKeyword}&popular=true`;
    } else {
      const categoryParam = category ? `&category=${category}` : '';
      url = `http://localhost:9999/board/list?pageNo=${pageNo}${categoryParam}&sortOrder=${sortOrder}&searchType=${searchType}&searchKeyword=${searchKeyword}`;
    }

    axios.get(url)
      .then(response => {
        console.log('Response:', response); // 응답 데이터 확인
        setBoardList(response.data.list);
        const pageCount = response.data.pagging.totalPage; // Spring에서 계산된 totalPage 사용
        console.log('Total Pages:', pageCount); // 계산된 페이지 수 확인
        setTotalPages(pageCount);
        setIsLoading(false); // 데이터 로딩 완료
      })
      .catch(error => {
        console.error("Error fetching board data", error);
        setIsLoading(false); // 에러 발생 시에도 로딩 상태를 false로 설정
      });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:9999/categories');
        const categoryData = [{ categorieNo: 'popular', categorieName: '인기글' }, ...response.data];
        setCategories(categoryData);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };

    setIsLoading(true); // 데이터 로딩 시작
    readData(currentPage, selectedCategory, sortOrder, searchType, searchKeyword);
    fetchCategories();
  }, [currentPage, selectedCategory, sortOrder, searchKeyword]);

  const handlePageChange = (pageNo) => {
    setCurrentPage(pageNo);
    saveStateToSession({
      currentPage: pageNo,
      selectedCategory,
      sortOrder,
      searchType,
      searchKeyword
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSortOrder('date'); // 정렬 옵션 기본값으로 설정
    setSearchType('title'); // 검색 필터 기본값으로 설정
    setSearchKeyword(''); // 검색창 비우기
    setTempSearchKeyword(''); // 임시 검색창 비우기
    setCurrentPage(1); // 카테고리 변경 시 페이지를 1로 초기화
    setIsLoading(true); // 로딩 상태 설정
    window.scrollTo(0, 0); // 스크롤을 맨 위로 이동
    saveStateToSession({
      currentPage: 1,
      selectedCategory: category,
      sortOrder: 'date',
      searchType: 'title',
      searchKeyword: ''
    });
    readData(1, category, 'date', 'title', ''); // 초기화된 값으로 데이터 읽기
  };

  const handleAllCategories = () => {
    setSelectedCategory(null);
    setSortOrder('date'); // 정렬 옵션 기본값으로 설정
    setSearchType('title'); // 검색 필터 기본값으로 설정
    setSearchKeyword(''); // 검색창 비우기
    setTempSearchKeyword(''); // 임시 검색창 비우기
    setCurrentPage(1);
    setIsLoading(true); // 로딩 상태 설정
    window.scrollTo(0, 0); // 스크롤을 맨 위로 이동
    saveStateToSession({
      currentPage: 1,
      selectedCategory: null,
      sortOrder: 'date',
      searchType: 'title',
      searchKeyword: ''
    });
    readData(1, null, 'date', 'title', ''); // 초기화된 값으로 데이터 읽기
  };

  const handleSortChange = (event) => {
    const newSortOrder = event.target.value;
    setSortOrder(newSortOrder);
    setCurrentPage(1); // 페이지를 1로 초기화
    saveStateToSession({
      currentPage: 1,
      selectedCategory,
      sortOrder: newSortOrder,
      searchType,
      searchKeyword
    });
    setIsLoading(true);
    readData(1, selectedCategory, newSortOrder, searchType, searchKeyword);
    window.scrollTo(0, 0); // 스크롤을 맨 위로 이동
  };

  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
    saveStateToSession({
      currentPage,
      selectedCategory,
      sortOrder,
      searchType: event.target.value,
      searchKeyword
    });
  };

  const handleTempSearchKeywordChange = (event) => {
    setTempSearchKeyword(event.target.value);
  };

  const handleSearch = () => {
    if (tempSearchKeyword.trim() === '' || tempSearchKeyword.length > 100) {
      alert('검색어는 공백일 수 없으며 100자를 초과할 수 없습니다.');
      setTempSearchKeyword(''); // 검색 입력창 비우기
      return;
    }

    setSearchKeyword(tempSearchKeyword);
    setCurrentPage(1);
    setIsLoading(true);
    saveStateToSession({
      currentPage: 1,
      selectedCategory,
      sortOrder,
      searchType,
      searchKeyword: tempSearchKeyword
    });
    readData(1, selectedCategory, sortOrder, searchType, tempSearchKeyword);
    window.scrollTo(0, 0); // 검색할 때도 스크롤을 맨 위로 이동
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleWriteButtonClick = useCallback(() => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
  
    navigate('/board/write', { state: { selectedCategory } });
  }, [user, navigate, selectedCategory]);

  const renderPagination = () => {
    const pageNumbers = [];
    const totalPagesToShow = 7; // 한 번에 표시할 페이지 수
    let startPage = Math.max(currentPage - Math.floor(totalPagesToShow / 2), 1);
    let endPage = startPage + totalPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(endPage - totalPagesToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        {currentPage > 1 && (
          <>
            <button onClick={() => handlePageChange(1)}>맨 앞으로</button>
            <button onClick={() => handlePageChange(currentPage - 1)}>앞으로</button>
          </>
        )}
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageChange(number)}
            className={currentPage === number ? styles.active : ''}
          >
            {number}
          </button>
        ))}
        {currentPage < totalPages && (
          <>
            <button onClick={() => handlePageChange(currentPage + 1)}>뒤로</button>
            <button onClick={() => handlePageChange(totalPages)}>맨 뒤로</button>
          </>
        )}
      </div>
    );
  };

  // 날짜 형식 변환 함수
  const formatDate = (dateString) => {
    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options).replace(/\./g, '.').replace(/\.$/, '').replace(/\s/g, '');
  };

  return (
    <>
    <div className={styles.boardContainer}>
      <h2>게시판 목록</h2>
      {categories.length > 0 && (
        <div className={styles.categories}>
          <h3>카테고리</h3>
          <ul>
            <li 
              onClick={handleAllCategories} 
              className={selectedCategory === null ? styles.selected : ''}
            >
              전체
            </li>
            {categories.map(category => (
              <li 
                key={category.categorieNo} 
                onClick={() => handleCategoryChange(category.categorieNo)} 
                className={selectedCategory === category.categorieNo ? styles.selected : ''}
              >
                {category.categorieName}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      
      
      {!isLoading && (
        <div className={styles.writeButtonContainer}>
          <button className={styles.writeButton} onClick={handleWriteButtonClick}>
            글쓰기
          </button>
        </div>
      )}


      <div className={styles.sortOrder}>
        <label htmlFor="sortOrder">정렬: </label>
        <select id="sortOrder" value={sortOrder} onChange={handleSortChange}>
          <option value="date">날짜순</option>
          <option value="likes">추천순</option>
          <option value="views">조회순</option>
        </select>
      </div>


      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {boardList.length === 0 ? (
            <div>게시글이 없습니다.</div>
          ) : (
            <ul className={styles.boardList}>
              {boardList.map((item, idx) => (
                <li key={idx} className={styles.boardItem}>
                  <div className={styles.boardItemTitle}>
                    <div>{item.boardNo}</div>
                    <span>{formatDate(item.boardWriteDate)}</span>
                    <Link to={`/board/${item.boardNo}`}>
                      {item.boardTitle}
                    </Link>
                  </div>
                  <div className={styles.boardItemInfo}>
                    <span>{item.userNick}</span>
                    <span>조회수: {item.boardCount}</span>
                    <span>추천수: {item.boardLike}</span>
                    <span>댓글수: {item.commentCount}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {renderPagination()}
        </>
        
      )}
      <div className={styles.searchBar}>
        <label htmlFor="searchType">검색: </label>
        <select id="searchType" value={searchType} onChange={handleSearchTypeChange}>
          <option value="title">제목</option>
          <option value="content">내용</option>
          <option value="title_content">제목+내용</option>
          <option value="nick">닉네임</option>
        </select>
        <input 
          type="text" 
          value={tempSearchKeyword} 
          onChange={handleTempSearchKeywordChange} 
          placeholder="검색어를 입력하세요" 
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch}>검색</button>
      </div>
    </div>
    </>
  );
}
