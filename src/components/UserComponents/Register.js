import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../../css/UserCss/Register.css';
import PostcodeComponent from '../../contexts/PostcodeComponent';
import defaultProfileImage from '../../img/register/user.png'; // 기본 이미지 경로

const ProfileImageUpload = ({ setUserProImg }) => {
  const [preview, setPreview] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setUserProImg(e.target.result); // Base64 인코딩된 이미지 설정
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="profile-image-upload"
         onDrop={handleDrop}
         onDragOver={handleDragOver}>
      {preview ? (
        <img src={preview} alt="Profile Preview" className="profile-preview" />
      ) : (
        <p>프로필 사진을 <br/>드래그 해주세요</p>
      )}
    </div>
  );
};

// 회원가입 컴포넌트
function Register() {
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userEmailProvider, setUserEmailProvider] = useState('naver.com'); // 기본 이메일 제공자 설정
  const [userPasswd, setUserPasswd] = useState('');
  const [userNick, setUserNick] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [userProImg, setUserProImg] = useState(null);

  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const email = query.get('email');
    const nickname = query.get('nickname');
    const profileImage = query.get('profileImage');

    if (email && nickname && profileImage) {
      setUserEmail(email.split('@')[0]);
      setUserEmailProvider(email.split('@')[1]);
      setUserNick(nickname);
      setUserProImg(profileImage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userEmailFull = `${userEmail}@${userEmailProvider}`;
    
    const user = {
      userId,
      userEmail: userEmailFull,
      userPasswd,
      userNick,
      userAddress: `${address} ${extraAddress} ${detailAddress}`,
      userProImg: userProImg || defaultProfileImage // 프로필 이미지가 없으면 기본 이미지 사용
    };

    try {
      const response = await fetch('http://localhost:9999/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert('회원가입 성공');
        navigate('/login'); // 회원가입 성공 시 /login 경로로 리디렉션
      } else {
        alert('회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 과정에서 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-container">
      <Link to="/" className="logo_link">
        <img src={`${process.env.PUBLIC_URL}/images/login/login_logo.png`} alt="Logo" className="register_logo" />
      </Link>
      <p className="intro_1">동네방네에 오신 것을 환영합니다.</p>
      <p className="intro_2">동네방네는 다양한 기능을 제공하는<br/> 지역 기반 커뮤니티입니다.</p>
      <h2>회원가입</h2>
      <ProfileImageUpload setUserProImg={setUserProImg} />
      <form onSubmit={handleSubmit}>
        <div className="separator">
          <span className="separator-text">회원 정보를 입력해주세요</span>
        </div>
        <input type="text" placeholder="아이디를 입력하세요" required value={userId} onChange={(e) => setUserId(e.target.value)} />
        <div className="email-container">
          <input type="text" placeholder="e-mail" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          <p>@</p>
          <select value={userEmailProvider} onChange={(e) => setUserEmailProvider(e.target.value)}>
            <option value="naver.com">naver.com</option>
            <option value="gmail.com">gmail.com</option>
            <option value="daum.net">daum.net</option>
            <option value="nate.com">nate.com</option>
          </select>
        </div>
        <input type="password" placeholder="비밀번호를 입력하세요" required value={userPasswd} onChange={(e) => setUserPasswd(e.target.value)} />
        <input type="text" placeholder="닉네임을 입력하세요" required value={userNick} onChange={(e) => setUserNick(e.target.value)} />
        <div className="separator">
          <span className="separator-text">주소를 입력해주세요</span>
        </div>
        <PostcodeComponent
          address={address}
          setAddress={setAddress}
          detailAddress={detailAddress}
          setDetailAddress={setDetailAddress}
          extraAddress={extraAddress}
          setExtraAddress={setExtraAddress}
        />
       
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default Register;
