function App() {
  return (
    <div className="bg-gray-900 text-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 text-center py-20 px-4">
        <h1 className="text-5xl font-bold md:text-7xl">
          Welcome to the IVE Fan Website
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
          Stay updated with the latest news, music, and exclusive content about
          IVE.
        </p>
        <button className="mt-8 px-6 py-3 bg-white text-purple-700 rounded-lg shadow-lg hover:bg-gray-100">
          Explore More
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-900 rounded-t-lg transform -translate-y-2 rotate-2 scale-110"></div>
      </header>

      {/* Members Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Meet the Members
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Member Card */}
          {["Yujin", "Gaeul", "Rei", "Wonyoung", "Liz", "Leeseo"].map(
            (member) => (
              <div
                key={member}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <div className="h-48 bg-gray-500"></div>
                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold">{member}</h3>
                  <p className="text-sm text-gray-400">Role in Group</p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-gray-800 py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Gallery Preview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-gray-700 h-48 rounded-lg overflow-hidden hover:opacity-80"
            >
              {/* Placeholder for images */}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-pink-500 rounded-lg hover:bg-pink-600">
            View Full Gallery
          </button>
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
