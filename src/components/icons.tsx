
import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .6.4 1 1 1h12c.6 0 1-.4 1-1V7.5L15.5 2z" />
      <path d="M15 2v5h5" />
      <path d="m10 16-2-2 2-2" />
      <path d="m14 12 2 2-2 2" />
    </svg>
  ),
  google: (props: SVGProps<SVGSVGElement>) => (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Google</title>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.08-2.58 2.26-4.8 2.26-4.22 0-7.65-3.5-7.65-7.8s3.43-7.8 7.65-7.8c2.44 0 3.98 1.02 4.9 1.94l2.62-2.52C18.49 1.92 15.96 0 12.48 0 5.6 0 0 5.6 0 12.5S5.6 25 12.48 25c7.2 0 12-4.82 12-12.24 0-.76-.08-1.48-.2-2.24l-9.8.04z"
      />
    </svg>
  ),
};
