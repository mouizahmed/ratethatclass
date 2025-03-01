'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/authContext';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Review } from '@/types/review';
import { getUserDownvotes, getUserPosts, getUserUpvotes } from '@/requests/getRequests';
import { ReviewCard } from '@/components/display/ReviewCard';
import { sendEmailVerification } from 'firebase/auth';
import { Spinner } from '@/components/ui/Spinner';
import { useAlert } from '@/contexts/alertContext';

export default function Page() {
  const { userLoggedIn, currentUser } = useAuth();
  const { addAlert } = useAlert();

  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [upvotes, setUpvotes] = useState<Review[]>([]);
  const [downvotes, setDownvotes] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const clearPosts = () => {
    setUserReviews([]);
    setUpvotes([]);
    setDownvotes([]);
  };

  const getPosts = useCallback(
    async (type: 'all' | 'upvoted' | 'downvoted') => {
      try {
        setLoading(true);
        if (type === 'all') {
          await getUserPosts(setUserReviews);
        } else if (type === 'upvoted') {
          await getUserUpvotes(setUpvotes);
        } else if (type === 'downvoted') {
          await getUserDownvotes(setDownvotes);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        addAlert('destructive', (error as Error).message, 3000);
      }
    },
    [addAlert]
  );

  useEffect(() => {
    if (!userLoggedIn) {
      redirect('/login');
    }

    const fetchData = async () => {
      getPosts('all');
    };
    fetchData();
  }, [userLoggedIn, getPosts]);

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

            <Tabs defaultValue="Posted Reviews" className="pt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="Posted Reviews"
                  onClick={async () => {
                    clearPosts();
                    getPosts('all');
                  }}
                >
                  Posted
                </TabsTrigger>
                <TabsTrigger
                  value="Up Voted Reviews"
                  onClick={() => {
                    clearPosts();
                    getPosts('upvoted');
                  }}
                >
                  Up Voted
                </TabsTrigger>
                <TabsTrigger
                  value="Down Voted Reviews"
                  onClick={() => {
                    clearPosts();
                    getPosts('downvoted');
                  }}
                >
                  Down Voted
                </TabsTrigger>
              </TabsList>
              <TabsContent value="Posted Reviews">
                <div className="grid md:grid-cols-1 gap-10 w-full max-w-3xl pt-4">
                  {loading ? (
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
                  {loading ? (
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
                  {loading ? (
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
