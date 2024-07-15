import { Button, Frog } from 'frog'
import { neynar } from 'frog/middlewares'
import { handle } from 'frog/vercel'

// Uncomment this packages to tested on local server
// import { devtools } from 'frog/dev';
// import { serveStatic } from 'frog/serve-static';


const baseUrl = "https://warpcast.com/~/compose";
const text = "Mint Glo Dollars NFTs 🍄\nFrame by @0x94t3z.eth";
const embedUrl = "https://glo-dollars-nft.vercel.app/api/frame";

const CAST_INTENS = `${baseUrl}?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(embedUrl)}`;


export const app = new Frog({
  assetsPath: '/',
  basePath: '/api/frame',
  title: 'Glo Dollars NFTs',
  imageAspectRatio: '1:1',
  browserLocation: CAST_INTENS,
  headers: {
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate max-age=0, s-maxage=0',
  },
  imageOptions: {
    height: 1024,
    width: 1024,
  },
}).use(
  neynar({
    apiKey: process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS',
    features: ['interactor', 'cast'],
  }),
)

// Neynar API base URL
const baseUrlNeynarV2 = process.env.BASE_URL_NEYNAR_V2 || 'https://api.neynar.com/v2/farcaster';

app.frame('/', (c) => {
  return c.res({
    headers: {
      'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate max-age=0, s-maxage=0',
    },
    image: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7dd48b82-9e40-470e-340d-8cba0fcee700/original',
    intents: [
      <Button action="/verify">Mint NFT</Button>,
    ],
  })
})


app.frame('/verify', async (c) => {
  const { fid } = c.var.interactor || {}
  const { hash } = c.var.cast || {}

  try {
    // Fetch the user's data from Neynar API
    const userResponse = await fetch(`${baseUrlNeynarV2}/user/bulk?fids=313172&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS',
      },
    });

    // Check if the response is okay
    if (!userResponse.ok) {
      throw new Error(`Neynar API responded with status: ${userResponse.status}`);
    }

    const castResponse = await fetch(`${baseUrlNeynarV2}/casts?casts=${hash}&viewer_fid=${fid}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS',
      },
    });

    // Check if the response is okay
    if (!castResponse.ok) {
      throw new Error(`Neynar API responded with status: ${castResponse.status}`);
    }

    const userData = await userResponse.json();
    const user = userData.users[0];

    const isFollowing = user.viewer_context.following;

    const castData = await castResponse.json();
    const cast = castData.result.casts[0];

    const isRecast = cast.viewer_context.recasted;

    // Perform actions based on isFollowing
    if (isFollowing && isRecast) {
      return c.res({
        image: 'https://media.decentralized-content.com/-/rs:fit:1920:1920/aHR0cHM6Ly9tYWdpYy5kZWNlbnRyYWxpemVkLWNvbnRlbnQuY29tL2lwZnMvYmFmeWJlaWN4YjN6eGppdTJ1ZzZ1dTZlY3hoaWt2bzVyNDJyNzZrdWU3cWZocTdxeXdya3hmcW1sdnE',
        intents: [
          <Button.Mint
            target="eip155:8453:0xad7014cbf4e9bf1731cc232ec93448965cd1f77d:1"
          >
            Mint
          </Button.Mint>,
        ],
      })
    } else {
      return c.error( {
        message: 'You need to re-cast & follow @glodollar first!',
      })
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return c.res({
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate max-age=0, s-maxage=0',
      },
      image: 'https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/7dd48b82-9e40-470e-340d-8cba0fcee700/original',
      intents: [
        <Button action="/verify">Refresh</Button>,
        <Button.Link href="https://warpcast.com/glodollar">Follow @glodollar</Button.Link>,
      ],
    })
}
})

// Uncomment for local server testing
// devtools(app, { serveStatic });

export const GET = handle(app)
export const POST = handle(app)
