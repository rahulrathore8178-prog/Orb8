import { createSlice } from "@reduxjs/toolkit";
import { fetchPosts, handleLike } from "../../utilites/communityHelper";

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    showComments: {},
    commentText: {},
    isCommenting: {},
    isCommentLiked: {},
    commentLikedCount: {},
    replyText: {},
    commentReplying: {},
    localCommentReplies: [],
    repliesOpen: {},
    submittingReply: {},
    liked: {},
    likeCounts: {},
    heartAnim: {},
    showModal: {},
    posts: [],
    page: 1,
    hasMore: true,
    isLoading: false,
    selectedPost: null,
    commentLiked: {},
    error: '',
  },
  reducers: {
    setShowComments: (state, action) => {
      const { postId, value } = action.payload;
      state.showComments[postId] = value;
    },
    setCommentText: (state, action) => {
      const { postId, value } = action.payload;
      state.commentText[postId] = value;
    },
    setIsCommenting: (state, action) => {
      const { postId, value } = action.payload;
      state.isCommenting[postId] = value;
    },
    setIsCommentLiked: (state, action) => {
      const { commentId, value } = action.payload;
      state.isCommentLiked[commentId] = value;
    },
    setCommentLikedCount: (state, action) => {
      const { commentId, value } = action.payload;
      state.commentLikedCount[commentId] = value;
    },
    setReplyText: (state, action) => {
      const { commentId, value } = action.payload;
      state.replyText[commentId] = value;
    },
    setCommentReplying: (state, action) => {
      const { postId, commentId, value } = action.payload;
      state.commentReplying[postId, commentId] = value;
    },
    setLocalCommentReplies: (state, action) => {
      const { commentId, replies } = action.payload;
      state.localCommentReplies = {
        ...state.localCommentReplies,
        [commentId]: replies
      };
    },
    setRepliesOpen: (state, action) => {
      const { postId, commentId, value } = action.payload;
      state.repliesOpen[postId, commentId] = value;
    },
    setIsSubmittingReply: (state, action) => {
      const { commentId, value } = action.payload;
      state.isSubmittingReply[commentId] = value;
    },
    toggleLike: (state, action) => {
      const id = action.payload;
      const isLiked = state.liked[id];
      state.liked[id] = !isLiked;
      state.likeCounts[id] = isLiked ? (state.likeCounts[id] || 1) - 1 : (state.likeCounts[id] || 0) + 1;
    },
    toggleComments: (state, action) => {
      const id = action.payload;
      state.showComments[id] = !state.showComments[id];
    },
    setLiked: (state, action) => {
      const { postId, value } = action.payload;
      state.liked[postId] = value;
    },
    setLikeCount: (state, action) => {
      const { postId, value } = action.payload;
      state.likeCounts[postId] = value;
    },
    setHeartAnim: (state, action) => {
      const { postId, value } = action.payload;
      state.heartAnim[postId] = value;
    },
    setShowModal: (state, action) => {
      const { postId, value } = action.payload;
      state.showModal[postId] = value;
    },
    initPost: (state, action) => {
      const postId = action.payload;
      state.showComments[postId] = false;
      state.commentText[postId] = '';
      state.isCommenting[postId] = false;
      state.liked[postId] = false;
      state.likeCounts[postId] = 0;
      state.heartAnim[postId] = false;
    },
    setPosts: (state, action) => {
      if (typeof action.payload === 'function') {
        state.posts = action.payload(state.posts);
      } else {
        state.posts = action.payload;
      }
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    setCommentLiked: (state, action) => {
      const { commentId, value } = action.payload;
      state.commentLiked[commentId] = value;
    },
    addPostToTop: (state, action) => {
      const incoming = action.payload;
      const exists = state.posts.some(p => p.id === incoming.id);
      if (!exists) state.posts.unshift(incoming);
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const { posts, pageNum, hasMore } = action.payload;
        state.isLoading = false;
        state.hasMore = hasMore;

        if (pageNum === 1) {
          state.posts = posts;
        } else {
          state.posts = [...state.posts, ...posts];
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Prevent continuous pagination on server errors
        state.hasMore = false;
      })

    builder
      .addCase(handleLike.pending, (state) => {
        state.isLoading = true;
        state.error = '';
      })
      .addCase(handleLike.fulfilled, (state, action) => {
        const { postId, likesCount, isLiked } = action.payload;
        state.posts = state.posts.map(p =>
          p.id === postId ? { ...p, likesCount: likesCount, isLikedByCurrentUser: isLiked } : p
        );
        state.isLoading = false;
      })
      .addCase(handleLike.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
  },
});

export const { setShowComments, setCommentText, setIsCommenting, toggleLike, toggleComments, setLiked, setLikeCount, setHeartAnim, setShowModal, initPost, setPosts, setPage, setHasMore, setIsLoading, setError, setSelectedPost, setCommentReplying, setCommentLiked, setCommentLikedCount, setIsSubmittingReply, setReplyText, setRepliesOpen, setIsCommentLiked, setLocalCommentReplies, addPostToTop } = feedSlice.actions;
export default feedSlice.reducer;