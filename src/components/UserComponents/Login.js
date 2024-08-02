// src/pages/Login.js
import { Link } from "react-router-dom";
import '../../css/UserCss/Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // AuthContext 사용

export default function Login() {
  const idRef = useRef();
  const passwdRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth(); // AuthContext 사용

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get('state');
    const code = params.get('code');
    if (state && code) {
      axios.get(`http://localhost:9999/naver/callback?state=${state}&code=${code}`)
        .then(response => {
          console.log('네이버 로그인 성공:', response.data);
          login(response.data); // 로그인 정보 저장
          navigate('/'); // 메인 페이지로 이동
        })
        .catch(error => {
          console.error('네이버 로그인 실패:', error);
          setError('네이버 로그인 실패.');
        });
    }
  }, [login, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = idRef.current.value;
    const passwd = passwdRef.current.value;
    axios.post('http://localhost:9999/login', {
      id: id,
      passwd: passwd
    })
    .then(response => {
      alert('로그인 성공');
      console.log('로그인 성공:', response.data);
      login(response.data); // 로그인 정보 저장
      navigate('/');
    })
    .catch(error => {
      setError('로그인 실패. 아이디와 비밀번호를 확인하세요.');
    });
  };

  const handleNaverLogin = () => {
    window.location.href = 'http://localhost:9999/naver';
  };

  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:9999/kakao";
  };

  return (
    <>
      <div className="login_container">
        <div className="login_container_form">
          <Link to="/" className="logo_link">
            <img src={`${process.env.PUBLIC_URL}/images/login/login_logo.png`} alt="Logo" className="login_logo" />
          </Link>
          <p className="intro_1">동네방네에 오신것을 환영합니다.</p>
          <p className="intro_2">동네방네는 다양한 기능을 제공하는 지역 기반 커뮤니티입니다.</p>

          <div className="separator">
            <span className="separator-text">SNS 로그인</span>
          </div>

          <div className="sns_login">
            <a href="#" onClick={handleKakaoLogin} className="btn_kakao">KAKAO</a>
            <a href="#" onClick={handleNaverLogin} className="btn_naver">NAVER</a>
          </div>

          <div className="separator">
            <span className="separator-text">동네방네 아이디로 로그인</span>
          </div>

          <form onSubmit={handleSubmit}>   
            <div className="form_group">
              <label htmlFor="id">아이디</label>
              <input type="text" id="id" className="login_input" name="id" ref={idRef} />
              <label htmlFor="passwd">비밀번호</label>
              <input type="password" id="passwd" className="login_input" name="passwd" ref={passwdRef} />
            </div>
            <button type="submit" className="btn_login_submit">로그인</button>
          </form>
          {error && <div className="error_message">{error}</div>}
          <p className="noregister">아직 회원이 아니신가요? <Link to="/register">회원가입</Link></p>
          <p className="forgot-password">비밀번호를 잊으셨나요? <Link to="/password-reset">비밀번호 찾기</Link></p>
        </div>
      </div>
    </>
  );
}
