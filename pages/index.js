import PostFeed from "@/components/PostFeed";
import Metatags from "@/components/Metatags";
import Loader from "@/components/Loader";
import { firestore, fromMillis, postToJSON } from "@/lib/firebase";

import { useState } from "react";

// Max post to query per page
const LIMIT = 10;

export async function getServerSideProps(context) {
    const postsQuery = firestore
        .collectionGroup("posts")
        .where("published", "==", true)
        .orderBy("createdAt", "desc")
        .limit(LIMIT);

    const posts = (await postsQuery.get()).docs.map(postToJSON);

    return {
        props: { posts }, // will be passed to the page component as props
    };
}

export default function Home(props) {
    const [posts, setPosts] = useState(props.posts);
    const [loading, setLoading] = useState(false);

    const [postsEnd, setPostsEnd] = useState(false);

    // Get next page in pagination query
    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];

        const cursor =
            typeof last.createdAt === "number" ? fromMillis(last.createdAt) : last.createdAt;

        const query = firestore
            .collectionGroup("posts")
            .where("published", "==", true)
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(LIMIT);

        const newPosts = (await query.get()).docs.map((doc) => doc.data());

        setPosts(posts.concat(newPosts));
        setLoading(false);

        if (newPosts.length < LIMIT) {
            setPostsEnd(true);
        }
    };

    return (
        <main>
            {/* <Metatags title="Weblog | Home" description="Get the latest posts on our site" /> */}

            {!exitedHero && (
        <div className="card card-info hero">
          <h2>💡 Welcome to Devlog</h2>
          <p>
            Welcome! This app is built with Next.js and Firebase and is loosely
            inspired by Dev.to
          </p>
          <p>
            Sign up for an 👨‍🎤 account, ✍️ write posts; 💖 hearts & 💬 comments other's posts. All public content is server-rendered and
            seo optimized. (<a href="/raselshikdar/about-us" aria-lebel="About Us">📖 About</a> • <a href="/raselshikdar/privacy-policy" aria-lebel="Privacy Policy">🛡️ Privacy</a> • <a href="/raselshikdar/terms-of-service" aria-lebel="Terms of Service">📃 Terms</a>)
          </p>
          <span className="exit-hero" onClick={exitHero}>
            <abbr title="close">
              <AiOutlineCloseCircle />
            </abbr>
          </span>
        </div>
      )}

            <PostFeed posts={posts} />

            {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

            <Loader show={loading} />

            {postsEnd && "You have reached the end!"}
        </main>
    );
}
