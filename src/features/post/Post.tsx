import React, { useState } from "react";
import styles from "./Post.module.css";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Divider, Checkbox } from "@material-ui/core";
import { Favorite, FavoriteBorder } from "@material-ui/icons";

import { AvatarGroup } from "@material-ui/lab";

import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

import { selectProfiles } from "../auth/authSlice";

import {
  selectComments,
  fetchPostStart,
  fetchPostEnd,
  fetchAsyncPostComment,
  fetchAsyncPatchLiked,
} from "./postSlice";

import { PROPS_POST } from "../types";

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
  },
}));

const Post: React.FC<PROPS_POST> = ({
  postId,
  loginId,
  userPost,
  title,
  imageUrl,
  liked,
}) => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  // 全プロフィールを取得
  const profiles = useSelector(selectProfiles);
  // 全コメントを取得
  const comments = useSelector(selectComments);
  const [text, setText] = useState("");

  // 対象のポストに対応するコメントを抜き出す
  const commentsOnPost = comments.filter((comment) => {
    console.log();
    return comment.post === postId;
  });

  // コメントを投稿したユーザーのプロフィールを抜き出す
  const postUser = profiles.filter((profile) => {
    return profile.userProfile === userPost;
  });

  // コメントを投稿する
  const postComment = async (e: React.MouseEvent<HTMLElement>) => {
    // デフォルトのイベントを無効化
    e.preventDefault();
    const packet = { text: text, post: postId };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPostComment(packet));
    await dispatch(fetchPostEnd());
    setText("");
  };

  // いいねボタンが押された時に、liked　の値を更新
  const handlerLiked = async () => {
    const packet = {
      id: postId,
      title: title,
      current: liked,
      new: loginId,
    };
    await dispatch(fetchPostStart());
    await dispatch(fetchAsyncPatchLiked(packet));
    await dispatch(fetchPostEnd());
  };

  if (title) {
    return (
      <div className={styles.post}>
        <div className={styles.post_header}>
          <Avatar className={styles.post_avatar} src={postUser[0]?.img} />
          <h3>{postUser[0]?.nickName}</h3>
        </div>

        <img className={styles.post_image} src={imageUrl} alt="" />

        <h4 className={styles.post_text}>
          <Checkbox
            className={styles.post_checkBox}
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            checked={liked.some((like) => like === loginId)}
            onChange={handlerLiked}
          />
          <strong> {postUser[0]?.nickName}</strong> {title}
          <AvatarGroup max={7}>
            {liked.map((like) => (
              <Avatar
                className={styles.post_avatarGroup}
                key={like}
                src={
                  profiles.find((profile) => profile.userProfile === like)?.img
                }
              />
            ))}
          </AvatarGroup>
        </h4>

        {commentsOnPost.length ? (
          <>
            <Divider />
            <div className={styles.post_comments}>
              {commentsOnPost.map((comment) => (
                <div key={comment.id} className={styles.post_comment}>
                  <Avatar
                    src={
                      profiles.find(
                        (profile) => profile.userProfile === comment.userComment
                      )?.img
                    }
                    className={classes.small}
                  />

                  <p>
                    <strong className={styles.post_strong}>
                      {
                        profiles.find(
                          (profile) =>
                            profile.userProfile === comment.userComment
                        )?.nickName
                      }
                    </strong>
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <form className={styles.post_commentBox}>
          <input
            type="text"
            className={styles.post_input}
            placeholder="コメントを入力してください"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            disabled={!text.length}
            className={styles.post_button}
            type="submit"
            onClick={postComment}
          >
            投稿
          </button>
        </form>
      </div>
    );
  } else {
    return null;
  }
};

export default Post;
