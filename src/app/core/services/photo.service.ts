
import { Injectable } from '@angular/core';

// Capacitor Camera : permet de prendre une photo avec la caméra
// ou de sélectionner une image depuis la galerie.
import {Camera} from '@capacitor/camera';

// Capacitor Filesystem : permet d'enregistrer les fichiers
// directement dans le stockage local du téléphone.
import {
  Directory,
  Filesystem,
} from '@capacitor/filesystem';

// Capacitor Preferences : permet de sauvegarder de petites
// informations, comme le chemin de notre photo.
import { Preferences } from '@capacitor/preferences';

// convertFileSrc permet de transformer le chemin local
// en adresse utilisable dans l'attribut src d'une image.
import { Capacitor } from '@capacitor/core';
@Injectable({
  providedIn: 'root',
})
export class PhotoService {

  // Nom du dossier dans lequel les photos seront enregistrées.
  private readonly photoDirectory = 'profile-photos';

  // Prendre une photo et l'enregistrer sur le téléphone.
  // uid correspond à l'identifiant de l'utilisateur connecté.
  async takeAndSaveProfilePhoto(uid: string): Promise<string> {

  // 1. Ouvrir la caméra du téléphone pour prendre une photo.
    const photo = await Camera.takePhoto({
      quality: 80,
      editable: "in-app",
      includeMetadata: true,
    
    });

    // 2. Vérifier que Capacitor a bien retourné un chemin
    // vers le fichier image original.
    if (!photo.uri) {
      throw new Error(
        'Impossible de récupérer le chemin de la photo.'
      );
    }

    // 3. Lire le fichier image.
    // Sur Android et iOS, les données sont récupérées en Base64.
    const imageData = await Filesystem.readFile({
      path: photo.uri,
    });

    // Vérifier que les données récupérées sont bien une chaîne.
    if (typeof imageData.data !== 'string') {
      throw new Error(
        'Impossible de lire les données de la photo.'
      );
    }

    // 4. Construire un nom unique pour la photo.
    // L'identifiant utilisateur permet de distinguer les profils.
    const extension = photo.metadata?.format || 'jpeg';

    const fileName =
      `${uid}-${Date.now()}.${extension}`;

    // Le chemin relatif du fichier dans le téléphone.
    const filePath =
      `${this.photoDirectory}/${fileName}`;

    // 5. Enregistrer réellement l'image dans le stockage local.
    // Directory.Data correspond au dossier privé de l'application.
    await Filesystem.writeFile({
      path: filePath,
      data: imageData.data,
      directory: Directory.Data,
      recursive: true,
    });

    // 6. Récupérer l'ancien chemin de la photo, s'il existe.
    const preferenceKey = `profile_photo_${uid}`;

    const oldPhoto = await Preferences.get({
      key: preferenceKey,
    });

    // 7. Enregistrer le nouveau chemin dans Preferences.
    // Preferences ne contient que le chemin, pas l'image.
    await Preferences.set({
      key: preferenceKey,
      value: filePath,
    });

    // 8. Supprimer l'ancienne photo pour éviter
    // d'accumuler des fichiers inutiles.
    if (oldPhoto.value && oldPhoto.value !== filePath) {
      try {
        await Filesystem.deleteFile({
          path: oldPhoto.value,
          directory: Directory.Data,
        });
      } catch {
        // Si l'ancienne photo n'existe plus,
        // on continue sans bloquer l'application.
      }
    }

    // 9. Transformer le chemin local en adresse
    // utilisable pour afficher l'image dans Angular.
    const fileUri = await Filesystem.getUri({
      path: filePath,
      directory: Directory.Data,
    });

    return Capacitor.convertFileSrc(fileUri.uri);
  }

  // Récupérer la photo de profil d'un utilisateur.
  async getProfilePhoto(uid: string): Promise<string | null> {

    // Retrouver le chemin enregistré dans Preferences.
    const preferenceKey = `profile_photo_${uid}`;

    const savedPhoto = await Preferences.get({
      key: preferenceKey,
    });

    // Si aucun chemin n'existe, l'utilisateur
    // n'a pas encore enregistré de photo.
    if (!savedPhoto.value) {
      return null;
    }

    try {
      // Vérifier que le fichier existe toujours.
      await Filesystem.stat({
        path: savedPhoto.value,
        directory: Directory.Data,
      });

      // Récupérer son adresse locale.
      const fileUri = await Filesystem.getUri({
        path: savedPhoto.value,
        directory: Directory.Data,
      });

      // Retourner une adresse utilisable dans une image.
      return Capacitor.convertFileSrc(fileUri.uri);

    } catch {
  // Si le fichier n'existe plus, supprimer son ancien chemin.
  await Preferences.remove({
    key: preferenceKey,
  });

  return null;
}
    
  }

  // Supprimer la photo de profil d'un utilisateur.
  async deleteProfilePhoto(uid: string): Promise<void> {

    const preferenceKey = `profile_photo_${uid}`;

    // Récupérer le chemin enregistré.
    const savedPhoto = await Preferences.get({
      key: preferenceKey,
    });

    // Supprimer le fichier physique s'il existe.
    if (savedPhoto.value) {
      try {
        await Filesystem.deleteFile({
          path: savedPhoto.value,
          directory: Directory.Data,
        });
      } catch {
        // Le fichier peut avoir déjà été supprimé.
      }
    }

    // Supprimer également le chemin sauvegardé.
    await Preferences.remove({
      key: preferenceKey,
    });
  }
}
