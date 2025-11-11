import React from "react";

export default function GallerySection({ clinic }) {
  const images = clinic?.gallery || clinic?.images || [];

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-4">Galerie d'images</h2>
        {images && images.length ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {images.map((img, i) => (
              <div key={i} className="w-full h-40 bg-slate-100 rounded overflow-hidden">
                <img src={img?.url || img} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600">Aucune image pour le moment.</p>
        )}
      </div>
    </section>
  );
}
