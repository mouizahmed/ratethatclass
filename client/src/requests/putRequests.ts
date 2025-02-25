import axios from 'axios';

export async function voteUniversity(universityID: string) {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_URL}/university/vote-university/id/${universityID}`,
      {},
      {
        withCredentials: true,
      }
    );
  } catch (error) {
    throw new Error('Could not post vote for university.');
  }
}
