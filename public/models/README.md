# Modèles 3D (.glb / .gltf)

Dépose ici ton fichier, par exemple `personnage.glb`, puis dans
`components/three/PortfolioModel.tsx` :

1. En haut du fichier :
   ```ts
   import { useGLTF } from "@react-three/drei";
   ```
2. Dans le composant, remplace le `<mesh>` placeholder par :
   ```tsx
   const { scene } = useGLTF("/models/personnage.glb");
   return <group ref={group}><primitive object={scene} /></group>;
   ```
3. (Optionnel, préchargement) tout en bas du fichier :
   ```ts
   useGLTF.preload("/models/personnage.glb");
   ```

La logique de rotation au scroll ne change pas — seul le mesh est remplacé.
Pense à recentrer/mettre à l'échelle le modèle si besoin (`scale`, `position`
sur le `<primitive>`).
