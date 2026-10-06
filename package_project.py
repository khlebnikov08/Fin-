import os
import zipfile

def make_zip(source_dir, output_zip, filter_func=None):
    os.makedirs(os.path.dirname(os.path.abspath(output_zip)), exist_ok=True)
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude node_modules, .git, etc.
            dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '.cache', '.venv', '__pycache__', 'dist', 'dist-yandex')]
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, source_dir)
                if filter_func and not filter_func(rel_path):
                    continue
                zipf.write(file_path, rel_path)

def make_dist_zip(dist_dir, output_zip):
    os.makedirs(os.path.dirname(os.path.abspath(output_zip)), exist_ok=True)
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, dist_dir)
                # Avoid nesting the previously generated archives copied from public/.
                if rel_path.lower().endswith('.zip'):
                    continue
                zipf.write(file_path, rel_path)

if __name__ == '__main__':
    root_dir = os.path.abspath('.')
    public_dir = os.path.join(root_dir, 'public')
    dist_dir = os.path.join(root_dir, 'dist')
    os.makedirs(public_dir, exist_ok=True)

    # 1. Dist / Production build zip
    if os.path.exists(dist_dir):
        print("Packaging production dist...")
        make_dist_zip(dist_dir, os.path.join(public_dir, 'finlife-production-build.zip'))
        make_dist_zip(dist_dir, os.path.join(root_dir, 'finlife-production-build.zip'))

    # 2. Source code zip
    print("Packaging source code...")
    def source_filter(rel_path):
        # Exclude public zip files themselves from the source archive to keep it lean
        if rel_path.endswith('.zip') or rel_path.startswith('public/finlife-'):
            return False
        return True

    make_zip(root_dir, os.path.join(public_dir, 'finlife-source-code.zip'), source_filter)
    make_zip(root_dir, os.path.join(root_dir, 'finlife-source-code.zip'), source_filter)

    print("Archive creation complete!")
    print(f"Dist zip size: {os.path.getsize(os.path.join(public_dir, 'finlife-production-build.zip')) / 1024:.1f} KB")
    print(f"Source zip size: {os.path.getsize(os.path.join(public_dir, 'finlife-source-code.zip')) / 1024:.1f} KB")
