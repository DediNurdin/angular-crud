import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private service = inject(ProductService);

  products: Product[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.service.list(0, 24).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Gagal memuat data produk.';
        this.loading = false;
      }
    });
  }

  remove(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!product.id || !confirm(`Hapus "${product.title}"?`)) return;
    this.service.delete(product.id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== product.id);
      },
      error: () => (this.error = 'Gagal menghapus produk.')
    });
  }

  imageOf(product: Product): string {
    const raw = product.images?.[0] ?? '';
    // Platzi seed data sometimes stores images as a JSON-ish string with quotes/brackets.
    const cleaned = raw.replace(/^\["?|"?\]$/g, '').replace(/^"|"$/g, '');
    return cleaned || 'https://placehold.co/400x300?text=No+Image';
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'https://placehold.co/400x300?text=No+Image';
  }
}
