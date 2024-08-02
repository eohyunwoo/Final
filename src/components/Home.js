import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; 
import { Link, useNavigate } from 'react-router-dom';
import NewsCard from './NewsComponents/NewsCard'; // 뉴스 카드 컴포넌트 임포트

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const mapRef = useRef(null); // Kakao map reference

  const [mostViewedPosts, setMostViewedPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [articles, setArticles] = useState([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const newsInterval = useRef(null);

  const articlesPerPage = 1; // 한 번에 하나의 뉴스 기사만 보여주기

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting inquiry:', {
        userId: user.userId,
        title,
        message
      });

      await axios.post('http://localhost:9999/inquiries', {
        userId: user.userId,
        title,
        message
      }, {
        withCredentials: true // CORS 설정을 위한 추가 옵션
      });
      alert('문의사항이 성공적으로 제출되었습니다.');
      togglePopup();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('문의사항 제출에 실패했습니다.');
    }
  };

  const scrollToSection = (sectionRef, offset = 0) => {
    window.scrollTo({
      top: sectionRef.current.offsetTop + offset,
      behavior: 'smooth'
    });
  };

  const handleLogout = async () => {
    if (window.confirm('정말로 로그아웃 하시겠습니까?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    const fetchMostViewedPosts = async () => {
      try {
        const response = await axios.get('http://localhost:9999/board/list?sortOrder=views&pageNo=1&pageSize=5');
        setMostViewedPosts(response.data.list);
      } catch (error) {
        console.error("Error fetching most viewed posts", error);
      }
    };

    fetchMostViewedPosts();
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      const apiKey = 'd6d9128e58c34dd8addd373daf069b1e';
      const region = '서울';
      const url = `https://newsapi.org/v2/everything?q=${region}&language=ko&apiKey=${apiKey}`;
      try {
        const response = await axios.get(url, { withCredentials: false });
        setArticles(response.data.articles);
      } catch (error) {
        console.error('뉴스를 가져오는 중 오류 발생:', error);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    newsInterval.current = setInterval(() => {
      setNewsIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }, 5000); // 5초마다 뉴스 변경

    return () => clearInterval(newsInterval.current); // 컴포넌트 언마운트 시 인터벌 클리어
  }, [articles.length]);

  const handleNextNews = () => {
    setNewsIndex((prevIndex) => (prevIndex + 1) % articles.length);
  };

  const handlePrevNews = () => {
    setNewsIndex((prevIndex) => (prevIndex - 1 + articles.length) % articles.length);
  };

  const formatDate = (dateString) => {
    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options).replace(/\./g, '.').replace(/\.$/, '').replace(/\s/g, '');
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mostViewedPosts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mostViewedPosts.length) % mostViewedPosts.length);
  };

  const navigateToBoard = () => {
    navigate('/board');
  };

  return (
    <div className="container">
      <div className="section1" ref={section3Ref}>
        <div className="section1_div1">
          <p className='section1_div1_h'>동네방네 - 지역기반 커뮤니티 사이트 ✨</p>
          <p className='section1_div1_p'>
            지역 주민들을 위한 다양한 커뮤니티 기능을 제공합니다!<br/>
            게시판, 실시간 채팅, 지도 서비스 등 다양한 기능을 통해
            지역사회와 소통하고 정보를 공유하세요!
          </p>
          <img src={`${process.env.PUBLIC_URL}/images/main/main_img.png`} alt="section1_div1" className="section1_div1_image" />
        </div>

        <div className='section1_div2'>
          <div className='section1_div2_div'>

          {mostViewedPosts.length > 0 && (
          <div className="most-viewed-post">
            <button className="slider-button prev" onClick={handlePrev}>‹</button>
            <div className={`slide ${currentIndex === 0 ? 'active' : ''}`}>
              <h3>게시물 TOP {currentIndex + 1} 🔥</h3>
              <Link to={`/board/${mostViewedPosts[currentIndex].boardNo}`}>
                <h4>{mostViewedPosts[currentIndex].boardTitle}</h4>
              </Link>
              <p>작성자: {mostViewedPosts[currentIndex].userNick}</p>
              <p>조회수: {mostViewedPosts[currentIndex].boardCount}</p>
              <p>작성일: {formatDate(mostViewedPosts[currentIndex].boardWriteDate)}</p>
              <p>지역명: {mostViewedPosts[currentIndex].regionName}</p>
              <button className="btn-view-more" onClick={navigateToBoard}>게시물 보러가기</button>
            </div>
            <button className="slider-button next" onClick={handleNext}>›</button>
          </div>
          )}
          
          </div>

          {/* 뉴스 영역 추가 */}
          <div className='section1_div2_div'>
            {articles.length > 0 && (
              <div className="home-news-slider">
                <button className="home-slider-button prev" onClick={handlePrevNews}>‹</button>
                <div className="home-news-item">
                  <h3>News {newsIndex + 1}</h3>
                  <div className="main-news-card">
                      <NewsCard article={articles[newsIndex]} />
                  </div>
                </div>
                <button className="home-slider-button next" onClick={handleNextNews}>›</button>
              </div>
            )}
          </div>

          <div className='section1_div2_div'>로그인</div>
        </div>
      </div>


      <div className="section2">
        <div className="section2_div1">
          <p>친구찾기 기능 넣을곳</p>
        </div>
        <div className="section2_div2">
          <p>ox퀴즈 기능 넣을곳</p>
        </div>
      </div>


      <div className="section3">
        <div className="section3_div1">
          <p>각각에 해당하는 설명?넣을곳</p>
        </div>
      </div>



    </div>
  );
}
