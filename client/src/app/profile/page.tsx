'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Review } from '@/types/review';
import { getUserDownvotes, getUserPosts, getUserUpvotes } from '@/requests/getAuthenticatedRequests';
import { ReviewCard } from '@/components/display/ReviewCard';
import { sendEmailVerification } from 'firebase/auth';
import { Spinner } from '@/components/ui/Spinner';
import { useAlert } from '@/contexts/alertContext';

export default function Page() {
  return (
    <AuthProvider>
      <ProfilePageInner />
    </AuthProvider>
  );
}

function ProfilePageInner() {
  const { userLoggedIn, currentUser, loading } = useAuth();
  const { addAlert } = useAlert();

  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [upvotes, setUpvotes] = useState<Review[]>([]);
  const [downvotes, setDownvotes] = useState<Review[]>([]);

  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
  const [hasMoreUpvotes, setHasMoreUpvotes] = useState<boolean>(true);
  const [hasMoreDownvotes, setHasMoreDownvotes] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Posted Reviews');

  const getPosts = useCallback(
    async (type: 'all' | 'upvoted' | 'downvoted', page: number = 1, append: boolean = false) => {
      try {
        if (page === 1) {
          setPostsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        if (type === 'all') {
          const response = await getUserPosts(setUserReviews, page, 10, 'date_uploaded', 'desc');
          const data = response.data;
          const meta = response.meta;
          if (append) {
            setUserReviews((prev) => [...prev, ...data]);
          } else {
            setUserReviews(data);
          }
          setHasMorePosts(meta.current_page < meta.total_pages);
        } else if (type === 'upvoted') {
          const response = await getUserUpvotes(setUpvotes, page, 10, 'date_uploaded', 'desc');
          const data = response.data;
          const meta = response.meta;
          if (append) {
            setUpvotes((prev) => [...prev, ...data]);
          } else {
            setUpvotes(data);
          }
          setHasMoreUpvotes(meta.current_page < meta.total_pages);
        } else if (type === 'downvoted') {
          const response = await getUserDownvotes(setDownvotes, page, 10, 'date_uploaded', 'desc');
          const data = response.data;
          const meta = response.meta;
          if (append) {
            setDownvotes((prev) => [...prev, ...data]);
          } else {
            setDownvotes(data);
          }
          setHasMoreDownvotes(meta.current_page < meta.total_pages);
        }

        if (page === 1) {
          setPostsLoading(false);
        } else {
          setIsLoadingMore(false);
        }
      } catch (error) {
        setPostsLoading(false);
        setIsLoadingMore(false);
        addAlert('destructive', (error as Error).message, 3000);
      }
    },
    [addAlert]
  );

  const loadMoreReviews = useCallback(async () => {
    if (isLoadingMore) return;
    if (activeTab === 'Posted Reviews' && hasMorePosts) {
      await getPosts('all', currentPage + 1, true);
      setCurrentPage((prev) => prev + 1);
    } else if (activeTab === 'Up Voted Reviews' && hasMoreUpvotes) {
      await getPosts('upvoted', currentPage + 1, true);
      setCurrentPage((prev) => prev + 1);
    } else if (activeTab === 'Down Voted Reviews' && hasMoreDownvotes) {
      await getPosts('downvoted', currentPage + 1, true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [activeTab, currentPage, getPosts, hasMorePosts, hasMoreUpvotes, hasMoreDownvotes, isLoadingMore]);

  useEffect(() => {
    if (!loading && userLoggedIn) {
      getPosts('all');
    }
  }, [userLoggedIn, loading, getPosts]);

  useEffect(() => {
    if (!loading && !userLoggedIn) {
      redirect('/login');
    }
  }, [userLoggedIn, loading]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    if (value === 'Posted Reviews') {
      getPosts('all');
    } else if (value === 'Up Voted Reviews') {
      getPosts('upvoted');
    } else if (value === 'Down Voted Reviews') {
      getPosts('downvoted');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 p-8 sm:p-20">
      <div className="w-full max-w-3xl">
        {userLoggedIn && currentUser ? (
          <>
            <h2 className="flex items-center justify-between gap-1 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              <div>
                {currentUser?.displayName}
                <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
              </div>
              {currentUser?.emailVerified ? (
                <BadgeCheck className="text-blue-500" />
              ) : (
                <Button
                  variant="outline"
                  disabled={emailSent}
                  onClick={async () => {
                    try {
                      await sendEmailVerification(currentUser);
                      setEmailSent(true);
                      setTimeout(() => {
                        setEmailSent(false);
                      }, 2000);
                    } catch (error) {
                      console.log(error);
                      addAlert('destructive', (error as Error).message, 3000);
                    }
                  }}
                >
                  {!emailSent ? 'Resend Verification' : 'Email Sent!'}
                </Button>
              )}
            </h2>

            <Tabs defaultValue="Posted Reviews" className="pt-8" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Posted Reviews">Posted</TabsTrigger>
                <TabsTrigger value="Up Voted Reviews">Up Voted</TabsTrigger>
                <TabsTrigger value="Down Voted Reviews">Down Voted</TabsTrigger>
              </TabsList>
              <TabsContent value="Posted Reviews">
                <div className="grid md:grid-cols-1 gap-10 w-full max-w-3xl pt-4">
                  {postsLoading ? (
                    <Spinner size="medium" />
                  ) : userReviews.length != 0 ? (
                    <>
                      {userReviews.map((review) => (
                        <ReviewCard
                          key={review.review_id}
                          review={review}
                          preview={false}
                          onDelete={(deletedId) =>
                            setUserReviews((prev) => prev.filter((r) => r.review_id !== deletedId))
                          }
                        />
                      ))}
                      <div className="flex justify-center py-4">
                        {hasMorePosts && (
                          <Button onClick={loadMoreReviews} disabled={isLoadingMore} className="w-40">
                            {isLoadingMore ? (
                              <div className="flex items-center gap-2">
                                <Spinner size="small" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <p className="leading-7 [&:not(:first-child)]:mt-6">No posts found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="Up Voted Reviews">
                <div className="grid md:grid-cols-1 gap-10 w-full max-w-3xl pt-4">
                  {postsLoading ? (
                    <Spinner size="medium" />
                  ) : upvotes.length != 0 ? (
                    <>
                      {upvotes.map((review) => (
                        <ReviewCard
                          key={review.review_id}
                          review={review}
                          preview={false}
                          onDelete={(deletedId) =>
                            setDownvotes((prev) => prev.filter((r) => r.review_id !== deletedId))
                          }
                        />
                      ))}
                      <div className="flex justify-center py-4">
                        {hasMoreUpvotes && (
                          <Button onClick={loadMoreReviews} disabled={isLoadingMore} className="w-40">
                            {isLoadingMore ? (
                              <div className="flex items-center gap-2">
                                <Spinner size="small" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <p className="leading-7 [&:not(:first-child)]:mt-6">No posts found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="Down Voted Reviews">
                <div className="grid md:grid-cols-1 gap-10 w-full max-w-3xl pt-4">
                  {postsLoading ? (
                    <Spinner size="medium" />
                  ) : downvotes.length != 0 ? (
                    <>
                      {downvotes.map((review) => (
                        <ReviewCard
                          key={review.review_id}
                          review={review}
                          preview={false}
                          onDelete={(deletedId) => setUpvotes((prev) => prev.filter((r) => r.review_id !== deletedId))}
                        />
                      ))}
                      <div className="flex justify-center py-4">
                        {hasMoreDownvotes && (
                          <Button onClick={loadMoreReviews} disabled={isLoadingMore} className="w-40">
                            {isLoadingMore ? (
                              <div className="flex items-center gap-2">
                                <Spinner size="small" />
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-center">
                      <p className="leading-7 [&:not(:first-child)]:mt-6">No posts found.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </div>
    </div>
  );
}
