export default function Newsletter() {
  return (
    <div className="bg-gray-800 text-white py-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-serif mb-6">SUBSCRIBE TO OUR NEWSLETTER</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="ENTER YOUR EMAIL"
            className="flex-1 px-6 py-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-gray-400"
          />
          <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            SUBSCRIBE
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="#" className="underline">Privacy Policy</a> and{' '}
          <a href="#" className="underline">Terms of Service</a> apply.
        </p>
      </div>
    </div>
  );
}
