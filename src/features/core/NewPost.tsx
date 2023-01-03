import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./Core.module.css";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { File } from "../types";

import {
  selectOpenNewPost,
  resetOpenNewPost,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncNewPost,
} from "../post/postSlice";

import { Button, TextField, IconButton } from "@material-ui/core";
import { MdAddAPhoto } from "react-icons/md";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",
    width: 280,
    height: 220,
    padding: "50px",
    transform: "translate(-50%, -50%)",
  },
};

const NewPost = () => {
  const dispatch: AppDispatch = useDispatch();
  // モーダルの開閉状態を redux store から参照
  const openNewPost = useSelector(selectOpenNewPost);

  // ユーザーのプロフィール画像
  const [image, setImage] = useState<File | null>(null);
  // 投稿のタイトル
  const [title, setTitle] = useState("");

  const handlerEditPicture = () => {
    const fileInput = document.getElementById("imageInput");
    fileInput?.click();
  };

  // 新規投稿用の非同期関数
  const newPost = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const packet = { title: title, img: image };

    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncNewPost(packet));
    await dispatch(fetchPostEnd());

    // stateの初期化
    setTitle("");
    setImage(null);
    // モーダルを閉じる
    dispatch(resetOpenNewPost());
  };

  return (
    <>
      <Modal
        isOpen={openNewPost}
        onRequestClose={async () => {
          await dispatch(resetOpenNewPost());
        }}
        style={customStyles}
      >
        <form className={styles.core_signUp}>
          <h1 className="styles.core_title">Instagram clone</h1>

          <br />

          <TextField
            placeholder="キャプションを入力してください"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
          />

          <br />

          <input
            type="file"
            id="imageInput"
            hidden={true}
            onChange={(e) => setImage(e.target.files![0])}
          />

          <br />

          <IconButton onClick={handlerEditPicture}>
            <MdAddAPhoto />
          </IconButton>

          <br />

          <Button
            disabled={!title || !image}
            variant="contained"
            color="primary"
            onClick={newPost}
          >
            投稿
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default NewPost;
