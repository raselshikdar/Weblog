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
            <Metatags
        title="Weblog | Home"
        description="Get the latest posts on our site"
      />

            <div className="card card-info">
                <h2>💡 Weblog is Live</h2>
                <p>
    Welcome to Web Blog. This app is built with Next.js and Firebase and is inspired by Dev.to.{' '}
    [<a href="https://weblog.rweb.site/raselshikdar/usage-and-documentations">
      More...
    </a>]
  </p>
            </div>

            <PostFeed posts={posts} />

            {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

            <Loader show={loading} />

            {postsEnd && "You have reached the end!"}
        </main>
    );
}
