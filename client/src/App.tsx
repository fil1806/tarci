import React, { useEffect, useState } from "react";
import axios from "axios";
import Autosuggest from "react-autosuggest";
import "./App.css";

interface NaicsCode {
  code: string;
  name: string;
}
interface Industry {
  code: string;
  name: string;
}

function App() {
  // const [count, setCount] = useState(0);
  const [naicsCodes, setNaicsCodes] = useState<NaicsCode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NaicsCode[]>([]);
  const [value, setValue] = useState<string>("");

  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    const fetchNaicsCodes = async () => {
      try {
        const response = await axios.get<NaicsCode[]>(
          "http://localhost:3000/api/naics-codes"
        );
        setNaicsCodes(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch NAICS codes");
        setLoading(false);
      }
    };

    fetchNaicsCodes();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion: NaicsCode) => suggestion.name;

  const renderSuggestion = (suggestion: NaicsCode) => (
    <div>{suggestion.name}</div>
  );

  const getSuggestions = (value: string) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : naicsCodes.filter((code) =>
          code.name.toLowerCase().includes(inputValue)
        );
  };

  const onChange = (
    event: React.FormEvent<HTMLInputElement>,
    { newValue }: Autosuggest.ChangeEvent
  ) => {
    setValue(newValue);
  };

  const onSuggestionSelected = (
    event: any,
    { suggestion }: { suggestion: Industry }
  ) => {
    setSelectedCode(suggestion.code);
  };

  const handleSubmit = async () => {
    if (!selectedCode) return;
    console.log("selectedCode", selectedCode);
    try {
      const response = await axios.post("http://localhost:3000/api/companies", {
        naicsCode: selectedCode,
      });
      setCompanies(response.data.slice(0, 5)); // Get only the first 5 companies
    } catch (error) {
      console.error("Error searching for companies:", error);
    }
  };

  const inputProps = {
    placeholder: "Type an industry description",
    value,
    onChange,
  };

  return (
    <>
      <h1>Tarci Application</h1>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={onSuggestionSelected}
        renderSuggestionsContainer={({ containerProps, children }) => (
          <ul {...containerProps}>{children}</ul>
        )}
      />
      <button onClick={handleSubmit}>Submit</button>
      <div>
        <h2>Companies: {companies.length}</h2>
        <ul>
          {companies.map((company, index) => (
            <li key={index}>{company}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
