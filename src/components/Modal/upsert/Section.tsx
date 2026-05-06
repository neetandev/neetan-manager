import type { ReactNode } from "react";

interface Props {
  title: string;
  desc?: string;
  children: ReactNode;
  noGrid?: boolean;
}

export function Section({ title, desc, children, noGrid }: Props) {
  return (
    <section className="section">
      <header className="section-head">
        <h3 className="section-title">{title}</h3>
        {desc && <p className="section-desc">{desc}</p>}
      </header>
      {noGrid ? children : <div className="form-grid">{children}</div>}
    </section>
  );
}
