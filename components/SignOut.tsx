export default function SignOut() {
  return (
    <a href="/auth/logout">
      <button className="px-4 py-2 text-red-600 hover:text-red-700 transition-colors">
          Logout
      </button>
    </a>
  );
}