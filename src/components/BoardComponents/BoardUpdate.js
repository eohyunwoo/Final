import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../../css/BoardCss/BoardWrite.css';

const BoardUpdate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { boardNo } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [removedFiles, setRemovedFiles] = useState([]);

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/board/${boardNo}`);
        const boardData = response.data.board;
        setTitle(boardData.boardTitle);
        setContent(boardData.boardContent);
        setSelectedCategory(boardData.categorieNo);
        setExistingFiles(response.data.fileList);
      } catch (error) {
        console.error("Error fetching board data", error);
        alert('게시글 정보를 불러오는 데 실패했습니다.');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:9999/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories", error);
        alert('카테고리 정보를 불러오는 데 실패했습니다.');
      }
    };

    fetchBoardData();
    fetchCategories();
  }, [boardNo]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setContent(data);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 3) {
      alert('파일은 최대 3개까지 업로드할 수 있습니다.');
      return;
    }
    const newFiles = selectedFiles.filter(file => !files.some(existingFile => existingFile.name === file.name));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleFileRemove = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleExistingFileRemove = (fileNo) => {
    setRemovedFiles(prevRemovedFiles => [...prevRemovedFiles, fileNo]);
    setExistingFiles(prevFiles => prevFiles.filter(file => file.fno !== fileNo));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));
    formData.append('boardTitle', title);
    formData.append('boardContent', content);
    formData.append('userId', user.userId);
    formData.append('categorieNo', parseInt(selectedCategory, 10));
    removedFiles.forEach(fileNo => formData.append('dfile', fileNo));  // removedFiles 추가

    try {
      const response = await axios.post(`http://localhost:9999/board/update/${boardNo}`, formData);

      if (response.status === 200) {
        alert('글이 성공적으로 수정되었습니다.');
        navigate(`/board/${boardNo}`);
      }
    } catch (error) {
      console.error('Error updating board post', error);
      alert('글 수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/board/${boardNo}`);
  };

  class MyUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file
        .then(file => new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('upload', file);

          axios.post('http://localhost:9999/upload', formData)
            .then(response => {
              resolve({
                default: response.data.url
              });
            })
            .catch(error => {
              reject(error);
            });
        }));
    }

    abort() {
      // Reject the promise returned from the upload() method.
    }
  }

  function MyCustomUploadAdapterPlugin(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader);
    };
  }

  return (
    <div className="board-write-container">
      <h2>글 수정</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="boardTitle"
          value={title}
          onChange={handleTitleChange}
          placeholder="제목을 입력하세요"
          required
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          required
        >
          <option value="">카테고리를 선택하세요</option>
          {categories.map(category => (
            <option key={category.categorieNo} value={category.categorieNo}>
              {category.categorieName}
            </option>
          ))}
        </select>
        <CKEditor
          editor={ClassicEditor}
          data={content}
          onChange={handleEditorChange}
          config={{
            extraPlugins: [MyCustomUploadAdapterPlugin]
          }}
        />
        <div className="file-input-container">
          <input 
            type="file" 
            onChange={handleFileChange} 
            multiple 
            style={{ display: 'none' }} 
            id="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            파일 선택
          </label>
          {files.length === 0 && existingFiles.length === 0 ? (
            <p className="no-files">선택된 파일 없음</p>
          ) : (
            <ul className="file-list">
              {existingFiles.map((file, index) => (
                <li key={index}>
                  <a href={`http://localhost:9999/download/${file.fno}`} download>{file.fileName}</a>
                  <button type="button" onClick={() => handleExistingFileRemove(file.fno)}>X</button>
                </li>
              ))}
              {files.map((file, index) => (
                <li key={index}>
                  {file.name}
                  <button type="button" onClick={() => handleFileRemove(index)}>X</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="user-info">
          <label>작성자: {user.userId}</label> {/* 유저 아이디 표시 */}
        </div>
        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? '수정 중...' : '수정'}
          </button>
          <button type="button" onClick={handleCancel}>
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoardUpdate;
