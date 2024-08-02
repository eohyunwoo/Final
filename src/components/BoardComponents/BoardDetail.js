import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import '../../css/BoardCss/BoardDetail.css'; // 스타일 시트 추가
axios.defaults.withCredentials = true;

const fetchBoardDetail = async (boardNo, setBoard, setCommentList, setFileList) => {
  try {
    const { data } = await axios.get(`http://localhost:9999/board/${boardNo}`);
    setBoard(data.board);
    setCommentList(data.commentList);
    setFileList(data.fileList);
  } catch (error) {
    console.error('Error fetching board detail:', error);
  }
};

const BoardDetail = () => {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [fileList, setFileList] = useState([]); // 파일 목록 상태 추가
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBoardDetail(boardNo, setBoard, setCommentList, setFileList).finally(() => setIsLoading(false));
  }, [boardNo]);

  const handleBoardReaction = useCallback(async (type) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:9999/board${type}/${boardNo}`);
      setBoard(prevBoard => ({ ...prevBoard, [type === 'Like' ? 'boardLike' : 'boardHate']: data.count }));
    } catch (error) {
      console.error(`Error ${type.toLowerCase()}ing board:`, error);
    }
  }, [user, boardNo, navigate]);

  const handleCommentReaction = useCallback(async (type, cno) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:9999/comment${type}/${cno}`);
      setCommentList(prevComments =>
        prevComments.map(comment =>
          comment.commentNo === cno ? { ...comment, [type === 'Like' ? 'commentLike' : 'commentHate']: data.count } : comment
        )
      );
    } catch (error) {
      console.error(`Error ${type.toLowerCase()}ing comment:`, error);
    }
  }, [user, navigate]);

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (newComment.trim() === '' || newComment.length > 300) {
      alert('댓글은 공백일 수 없으며 300자를 초과할 수 없습니다.');
      return;
    }

    try {
      await axios.post('http://localhost:9999/comment/add', {
        boardNo: boardNo,
        userId: user.userId,
        commentContent: newComment,
      });
      // 댓글 작성 후 전체 댓글 목록을 다시 가져옵니다.
      await fetchBoardDetail(boardNo, setBoard, setCommentList, setFileList);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment", error);
      alert('댓글 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (cno) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:9999/comment/delete`, { params: { cno: cno, bno: boardNo } });
      if (response.data.status === 'success') {
        // 댓글 삭제 후 전체 댓글 목록을 다시 가져옵니다.
        await fetchBoardDetail(boardNo, setBoard, setCommentList, setFileList);
      } else {
        alert('댓글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error("Error deleting comment", error);
      alert('댓글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteBoard = async () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
  
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      if (user.userId !== board.userId) {
        alert('삭제 권한이 없습니다.');
        return;
      }
  
      try {
        const response = await axios.delete(`http://localhost:9999/board/delete/${boardNo}`);
        if (response.data.status === 'success') {
          alert('게시글이 삭제되었습니다.');
          navigate('/board');
        } else {
          alert('게시글 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error("Error deleting board", error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };
  

  const handleEditBoard = () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (user.userId !== board.userId) {
      alert('수정 권한이 없습니다.');
      return;
    }

    navigate(`/board/update/${boardNo}`);
  };

  if (isLoading) return <div>Loading...</div>; // 로딩 중일 때 표시

  if (!board) return <div>게시글을 불러오지 못했습니다.</div>;

  return (
    <div className="board-detail-container">
      <div className="board-detail-header">
        <h2>{board.boardTitle}</h2>
        <div className="content" dangerouslySetInnerHTML={{ __html: board.boardContent }} /> {/* HTML content 출력 */}
        <p className="author">작성자: {board.userId}</p>
        <p className="date">작성일: {board.boardWriteDate}</p>
        <p className="views">조회수: {board.boardCount}</p>
        <p className="likes">좋아요: {board.boardLike}</p>
        <p className="dislikes">싫어요: {board.boardHate}</p>
        <button onClick={handleDeleteBoard}>삭제</button>
        <button onClick={handleEditBoard}>수정</button>
      </div>
      <div className="board-detail-buttons">
        <button onClick={() => handleBoardReaction('Like')}>좋아요</button>
        <button onClick={() => handleBoardReaction('Hate')}>싫어요</button>
      </div>
      <hr />
      <div className="board-attachments">
        <h3>첨부파일</h3>
        {fileList.length > 0 ? (
          <ul className="file-list">
            {fileList.map((file, index) => (
              <li key={index}>
                <a href={`http://localhost:9999/download/${file.fno}`} download>{file.fileName}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>첨부파일이 없습니다.</p>
        )}
      </div>
      <hr />
      <div className="board-comments">
        <h3>댓글</h3>
        <form onSubmit={handleNewCommentSubmit}>
          <textarea
            value={newComment}
            onChange={handleNewCommentChange}
            placeholder="댓글을 입력하세요"
          />
          <button type="submit">댓글 달기</button>
        </form>
        {commentList.length > 0 ? (
          <ul className="comment-list">
            {commentList.map((comment, index) => (
              <li key={index} className="comment-item">
                <p className="author">{comment.userId}: {comment.commentContent}</p>
                <p className="date">{comment.commentWriteDate}</p>
                <p className="likes">Likes: {comment.commentLike}, Dislikes: {comment.commentHate}</p>
                <div className="comment-actions">
                  <button onClick={() => handleCommentReaction('Like', comment.commentNo)}>좋아요</button>
                  <button className="dislike-button" onClick={() => handleCommentReaction('Hate', comment.commentNo)}>싫어요</button>
                  {user && user.userId === comment.userId && (
                    <button onClick={() => handleDeleteComment(comment.commentNo)}>삭제</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
