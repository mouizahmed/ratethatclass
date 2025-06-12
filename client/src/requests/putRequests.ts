import axios from 'axios';

export async function voteUniversity(universityId: string) {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_URL}/university/requests/${universityId}/vote`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    console.log(error);
    throw new Error('Could not post vote for university.');
  }
}
