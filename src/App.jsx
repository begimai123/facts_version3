import { useEffect, useState } from "react";
import "./style.css";
import supabase from "./supabase";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        //select all
        let query = supabase.from("facts").select("*");

        if (currentCategory != "all")
          query = query.eq("category", currentCategory);

        const { data: facts, error } = await query
          .order("voteInteresting", { ascending: false })
          .limit(1000);
        // console.log(facts);

        if (!error) setFacts(facts);
        else alert("There was a problem with getting data!");
        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

       {showForm ? ( 
         <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
       ) : null} 
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactsList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState('');
  // Fixed in a video text overlay
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(text, source, category);

    if (text && isValidHttpUrl(source) && category && textLength <= 500) {

      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from('facts')
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      if (!error) setFacts((facts) => [newFact[0], ...facts]);

      setText('');
      setSource('');
      setCategory('');

      setShowForm(false);
    }
  }

  return (
    <form className='fact-form' onSubmit={handleSubmit}>
      <input
        type='text'
        placeholder='Share a fact with the world...'
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        value={source}
        type='text'
        placeholder='Source'
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value=''>Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className='btn btn-large' disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function Loader() {
  return <p>Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const title = "Fun Facts";

  return(
  <header className="header">
    <div className="logo">
      <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
      <h1>{title}</h1>
    </div>
    <button
      className="btn btn-large btn-open"
      onClick={() => setShowForm((show) => !show)}
    >
      {showForm ? "Close" : "Share a Fact"}
    </button>
  </header>
  )
}

function CategoryFilter({setCurrentCategory}) {
  return (
    <aside>
      <ul>
        <li>
          <button
            className="btn btn-all"
            onClick={() => {setCurrentCategory("all")}}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: category.color }}
              onClick={() => {setCurrentCategory(category.name)}}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("fact")
      .update({ [columnName]: fact[columnName] += 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }

  return (
    <li className="fact">
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find(
            (category) => category.name === fact.category
          ).color,
        }}
      >
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("voteInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.voteInteresting}
        </button>
        <button
          onClick={() => handleVote("voteMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.voteMindblowing}
        </button>
        <button
          onClick={() => handleVote("voteIncorrect")}
          disabled={isUpdating}
        >
          ⛔️ {fact.voteIncorrect}
        </button>
      </div>
    </li>
  );
}

function FactsList({ facts, setFacts }) {
  if (facts.length === 0) {
    return <p className="message">There are no facts! Create a new one! </p>;
  }

  // const [facts, setFacts] = useState([]);
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} setFacts={setFacts} />
        ))}
      </ul>
    </section>
  );
}

export default App;
