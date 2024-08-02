import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './css/main.css';
import Layout from './components/Layout';
import Board from './components/BoardComponents/Board';
import BoardDetail from './components/BoardComponents/BoardDetail';
import BoardWrite from './components/BoardComponents/BoardWrite'; // 새로 추가된 컴포넌트
import BoardUpdate from './components/BoardComponents/BoardUpdate';
import PasswordResetComponent from './components/UserComponents/PasswordResetComponent'; // 비밀번호 찾기 컴포넌트 임포트

import Home from './components/Home';
import Chat from './components/ChatComponents/Chat';
import Friend from './components/FriendComponents/Friend';
import Lost from './components/LostComponents/Lost';
import News from './components/NewsComponents/News';
import Login from './components/UserComponents/Login';
import Register from './components/UserComponents/Register';
import { AuthProvider } from './contexts/AuthContext';
import MyPage from './components/UserComponents/MyPage'; // 추가된 컴포넌트
import Admin from './components/UserComponents/Admin'; // 추가된 컴포넌트

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="board" element={<Board />} />
            <Route path="board/:boardNo" element={<BoardDetail />} />
            <Route path="board/write" element={<BoardWrite />} /> {/* BoardWrite 라우트 추가 */}
            <Route path="/board/update/:boardNo" element={<BoardUpdate />} />
            <Route path="chat" element={<Chat />} />
            <Route path="friend" element={<Friend />} />
            <Route path="lost" element={<Lost />} />
            <Route path="news" element={<News />} />
            <Route path="mypage" element={<MyPage />} /> {/* 추가된 라우트 */}
            <Route path="admin" element={<Admin />} /> {/* 추가된 라우트 */}

          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordResetComponent />} /> {/* 비밀번호 찾기 라우트 추가 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
