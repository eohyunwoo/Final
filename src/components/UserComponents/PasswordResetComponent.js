// src/components/PasswordResetComponent.js
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function PasswordResetComponent() {
  const [email, setEmail] = useState('');
  const [emailProvider, setEmailProvider] = useState('naver.com'); // 기본 이메일 제공자 설정
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userEmailFull = `${email}@${emailProvider}`;

    try {
      const response = await axios.post('http://localhost:9999/password-reset', {
        userId,
        userEmail: userEmailFull,
      });

      if (response.status === 200) {
        alert('비밀번호 재설정 이메일이 발송되었습니다.');
        navigate('/login'); // 성공 시 로그인 페이지로 이동
      } else {
        alert('비밀번호 재설정 실패');
      }
    } catch (error) {
      console.error('비밀번호 재설정 오류:', error);
      alert('비밀번호 재설정 과정에서 오류가 발생했습니다.');
    }
  };

  return (
    <div className="password-reset-container">
      <h2>비밀번호 찾기</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="userId">아이디</label>
          <input
            type="text"
            id="userId"
            placeholder="아이디를 입력하세요"
            required
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <div className="email-container form-group">
          <label htmlFor="email">이메일</label>
          <div className="email-input">
            <input
              type="text"
              id="email"
              placeholder="e-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p>@</p>
            <select
              value={emailProvider}
              onChange={(e) => setEmailProvider(e.target.value)}
            >
              <option value="naver.com">naver.com</option>
              <option value="gmail.com">gmail.com</option>
              <option value="daum.net">daum.net</option>
              <option value="nate.com">nate.com</option>
            </select>
          </div>
        </div>
        <button type="submit">비밀번호 찾기</button>
      </form>
    </div>
  );
}

export default PasswordResetComponent;
