import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RatingStars from '@/components/RatingStars';
import { Calendar, Briefcase, Star, MapPin, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  total_jobs_posted: number;
  total_jobs_completed: number;
  average_employer_rating: number | null;
  average_worker_rating: number | null;
  total_employer_reviews: number;
  total_worker_reviews: number;
}

interface Job {
  id: string;
  title: string;
  location: string;
  created_at: string;
  daily_salary: string;
  category?: string;
}

interface Rating {
  id: string;
  stars: number;
  feedback: string | null;
  created_at: string;
  rating_type: string;
  rater_name: string;
  job_title: string;
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch posted jobs (both active and completed)
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, location, created_at, daily_salary, category, status')
        .eq('user_id', userId)
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
        .limit(10);

      setPostedJobs(jobsData || []);

      // Fetch completed jobs (as worker)
      const { data: completionsData } = await supabase
        .from('job_completions')
        .select('job_id')
        .eq('completed_by_user_id', userId);

      if (completionsData && completionsData.length > 0) {
        const jobIds = completionsData.map(c => c.job_id);
        const { data: completedJobsData } = await supabase
          .from('jobs')
          .select('id, title, location, created_at, daily_salary, category')
          .in('id', jobIds)
          .limit(10);

        setCompletedJobs(completedJobsData || []);
      }

      // Fetch ratings received
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select(`
          id,
          stars,
          feedback,
          created_at,
          rating_type,
          rater_id,
          job_id
        `)
        .eq('rated_user_id', userId)
        .order('created_at', { ascending: false });

      if (ratingsData) {
        // Fetch rater names and job titles
        const ratingsWithDetails = await Promise.all(
          ratingsData.map(async (rating) => {
            const { data: raterProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('user_id', rating.rater_id)
              .single();

            const { data: job } = await supabase
              .from('jobs')
              .select('title')
              .eq('id', rating.job_id)
              .single();

            return {
              ...rating,
              rater_name: raterProfile?.name || 'Anonymous',
              job_title: job?.title || 'Unknown Job',
            };
          })
        );

        setRatings(ratingsWithDetails);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-4">This user profile doesn't exist.</p>
            <Link to="/" className="text-primary hover:underline">← Back to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = profile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const overallRating = profile.average_employer_rating && profile.average_worker_rating
    ? ((profile.average_employer_rating + profile.average_worker_rating) / 2)
    : profile.average_employer_rating || profile.average_worker_rating || null;

  const totalReviews = profile.total_employer_reviews + profile.total_worker_reviews;

  return (
    <>
      <SEOHead 
        title={`${profile.name}'s Profile | localjobzz`}
        description={`View ${profile.name}'s profile, ratings, and job history on localjobzz`}
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                    <div className="flex items-center gap-2">
                      <RatingStars value={overallRating || 0} readonly size="md" color="orange" />
                      <span className="text-sm text-muted-foreground">
                        {overallRating 
                          ? `${overallRating.toFixed(1)} (${totalReviews})` 
                          : 'No reviews yet'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(profile.created_at).getFullYear()}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary">
                      <Briefcase className="h-3 w-3 mr-1" />
                      {profile.total_jobs_posted} jobs posted
                    </Badge>
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      {profile.total_jobs_completed} jobs completed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="reviews" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="employer">As Employer</TabsTrigger>
              <TabsTrigger value="worker">As Worker</TabsTrigger>
            </TabsList>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>All Reviews ({totalReviews})</CardTitle>
                </CardHeader>
                <CardContent>
                  {ratings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                  ) : (
                    <div className="space-y-4">
                      {ratings.map((rating) => (
                        <div key={rating.id} className="border-b last:border-0 pb-4 last:pb-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-foreground">{rating.rater_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {rating.rating_type === 'employer_to_worker' ? 'As Worker' : 'As Employer'} • {rating.job_title}
                              </p>
                            </div>
                            <div className="text-right">
                              <RatingStars value={rating.stars} readonly size="sm" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          {rating.feedback && (
                            <p className="text-sm text-muted-foreground mt-2">{rating.feedback}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* As Employer Tab */}
            <TabsContent value="employer">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Jobs Posted ({profile.total_jobs_posted})</span>
                    {profile.average_employer_rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <RatingStars value={profile.average_employer_rating} readonly size="sm" />
                        <span>{profile.average_employer_rating.toFixed(1)} ({profile.total_employer_reviews})</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {postedJobs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No jobs posted</p>
                  ) : (
                    <div className="space-y-3">
                      {postedJobs.map((job) => (
                        <Link 
                          key={job.id} 
                          to={`/job/${job.id}`}
                          className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{job.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span>₹{job.daily_salary}/day</span>
                                {job.category && <Badge variant="outline" className="text-xs">{job.category}</Badge>}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* As Worker Tab */}
            <TabsContent value="worker">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Jobs Completed ({profile.total_jobs_completed})</span>
                    {profile.average_worker_rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <RatingStars value={profile.average_worker_rating} readonly size="sm" />
                        <span>{profile.average_worker_rating.toFixed(1)} ({profile.total_worker_reviews})</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedJobs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No jobs completed</p>
                  ) : (
                    <div className="space-y-3">
                      {completedJobs.map((job) => (
                        <Link 
                          key={job.id} 
                          to={`/job/${job.id}`}
                          className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">{job.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                                <span>₹{job.daily_salary}/day</span>
                                {job.category && <Badge variant="outline" className="text-xs">{job.category}</Badge>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default UserProfile;
