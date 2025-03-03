import React from "react";

function App() {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-purple-800 text-center py-20 px-4">
        <h1 className="text-5xl font-bold md:text-7xl tracking-wider">
          Welcome to IVE World
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-pink-200">
          Dive into the universe of IVE with their music, members, and latest
          updates.
        </p>
        <button className="mt-8 px-6 py-3 bg-white text-purple-700 font-bold rounded-full shadow-lg hover:bg-gray-100 hover:scale-105 transition-transform">
          Discover More
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-900 rounded-t-lg transform -translate-y-2 rotate-2 scale-110"></div>
      </header>

      {/* Members Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-pink-400">
          Meet the Members of IVE
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Member Card */}
          {["Yujin", "Gaeul", "Rei", "Wonyoung", "Liz", "Leeseo"].map(
            (member) => (
              <div
                key={member}
                className="bg-gradient-to-r from-pink-500 via-purple-600 to-purple-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <div className="h-48 bg-gray-700 flex items-center justify-center">
                  <p className="text-2xl font-bold text-white">{member}</p>
                </div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-pink-200">
                    {member}
                  </h3>
                  <p className="text-sm text-purple-300">Role in Group</p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Albums Section */}
      <section className="bg-gray-800 py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-pink-400">
          IVE Albums
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Album Card */}
          {[
            { title: "ELEVEN", release: "2021" },
            { title: "LOVE DIVE", release: "2022" },
            { title: "After LIKE", release: "2022" },
            { title: "I've IVE", release: "2023" },
            { title: "Kitsch", release: "2023" },
          ].map((album) => (
            <div
              key={album.title}
              className="bg-gradient-to-r from-pink-500 via-purple-600 to-purple-800 rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <div className="h-48 bg-gray-700 flex items-center justify-center">
                <p className="text-xl font-bold text-white tracking-wide">
                  {album.title}
                </p>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-pink-200">
                  {album.title}
                </h3>
                <p className="text-sm text-purple-300">
                  Released: {album.release}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-center py-8">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} IVE Fan Website | Made with ❤️ by an IVE
          fan
        </p>
      </footer>
    </div>
  );
}

export default App;
