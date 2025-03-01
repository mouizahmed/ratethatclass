'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/Spinner';
import { useAlert } from '@/contexts/alertContext';
import { useToast } from '@/hooks/use-toast';
import { getRequestedUniversities } from '@/requests/getRequests';
import { postUniversityRequest } from '@/requests/postRequests';
import { voteUniversity } from '@/requests/putRequests';
import { RequestedUniversity } from '@/types/university';
import React from 'react';
import react, { useState, useEffect } from 'react';

export default function Home() {
  const [universityName, setUniversityName] = useState<string>('');
  const [refresh, setRefresh] = useState<boolean>(false);
  const [requestedUniversityList, setRequestedUniversityList] = useState<RequestedUniversity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestSent, setRequestSent] = useState<boolean>(false);
  const { toast } = useToast();
  const { addAlert } = useAlert();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUniversityName(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRequestSent(true);
      await postUniversityRequest(universityName);
      toast({
        title: `Success!`,
        description: `Sucessfully requested ${universityName}`,
      });
      setRefresh((prev) => !prev);
      setRequestSent(false);
    } catch (error) {
      toast({
        title: `Uh oh! There was an error.`,
        description: `${(error as Error).message}`,
      });
      console.log(error);
      setRequestSent(false);
    }
  };

  const handleVote = async (university: RequestedUniversity) => {
    try {
      await voteUniversity(university.university_id);
      setRefresh((prev) => !prev);
      toast({
        title: `Success!`,
        description: `Sucessfully upvoted ${university.university_name}`,
      });
    } catch (error) {
      toast({
        title: `Uh oh! There was an error.`,
        description: `${(error as Error).message}`,
      });
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const requestedUniversities: RequestedUniversity[] = await getRequestedUniversities();
        setRequestedUniversityList(requestedUniversities);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        addAlert('destructive', (error as Error).message, 3000);
      }
    };
    fetchData();
  }, [refresh]);

  function filterSearch(university: RequestedUniversity) {
    let searchCheck = true;
    let departmentCheck = true;

    if (universityName.length !== 0) {
      searchCheck = university.university_name.toLowerCase().includes(universityName.toLowerCase());
    }

    return searchCheck;
  }

  const sortedRows = React.useMemo(
    () => [...(requestedUniversityList || [])].filter(filterSearch),
    [requestedUniversityList, universityName]
  );

  return (
    <div className="flex flex-col items-center gap-4 p-8 sm:p-20">
      <h1 className="scroll-m-20 text-xl lg:text-2xl font-semibold tracking-tight lg:text-5xl">
        Request to Add Your School
      </h1>

      <form className="w-full max-w-3xl flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          id="universityName"
          required
          value={universityName}
          onChange={handleChange}
          placeholder="Enter University Name"
        />
        <Button type="submit" disabled={requestSent}>
          {requestSent ? 'Sent!' : 'Request'}
        </Button>
      </form>

      <div className="w-full max-w-3xl border rounded-lg">
        <div className="grid grid-cols-3 p-2">
          <div className="flex justify-center">
            <h4 className="scroll-m-20 text-md font-semibold tracking-tight">School Name</h4>
          </div>
          <div className="flex justify-center">
            <h4 className="scroll-m-20 text-md font-semibold tracking-tight">Votes</h4>
          </div>
        </div>
        {loading ? (
          <Spinner size="medium" />
        ) : (
          sortedRows.map((university) => (
            <React.Fragment key={university.university_id}>
              <div className="grid grid-cols-3 p-2">
                <div className="flex justify-center">{university.university_name}</div>
                <div className="flex justify-center items-center gap-4">{university.total_votes}</div>
                <div className="flex justify-center items-center gap-4">
                  <Button
                    disabled={university.user_token ? true : false}
                    onClick={async () => await handleVote(university)}
                  >
                    Vote
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
