import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Category, ProductPayload } from '../../models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id?: number;
  loading = false;
  saving = false;
  error = '';
  categories: Category[] = [];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(2)]],
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, Validators.required],
    image: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
  });

  get isEdit(): boolean {
    return this.id != null;
  }

  ngOnInit(): void {
    this.service.categories().subscribe({
      next: (c) => (this.categories = c)
    });

    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id = Number(param);
      this.loadProduct(this.id);
    }
  }

  private loadProduct(id: number): void {
    this.loading = true;
    this.service.get(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          title: p.title,
          description: p.description,
          price: p.price,
          categoryId: p.category?.id ?? null,
          image: this.firstImage(p.images)
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Gagal memuat produk.';
        this.loading = false;
      }
    });
  }

  private firstImage(images?: string[]): string {
    const raw = images?.[0] ?? '';
    return raw.replace(/^\["?|"?\]$/g, '').replace(/^"|"$/g, '');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';

    const v = this.form.getRawValue();
    const payload: ProductPayload = {
      title: v.title!,
      price: Number(v.price),
      description: v.description!,
      categoryId: Number(v.categoryId),
      images: [v.image!]
    };

    const req = this.isEdit
      ? this.service.update(this.id!, payload)
      : this.service.create(payload);

    req.subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => {
        this.error = 'Gagal menyimpan produk.';
        this.saving = false;
      }
    });
  }
}
