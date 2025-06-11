import axios from 'axios';

export async function voteUniversity(universityID: string) {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_URL}/university/requests/${universityID}/vote`,
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
