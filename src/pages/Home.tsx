import { useState, useEffect } from "react";
import UrlInput from "../components/UrlInput";
import TestList from "../components/TestList";
import { runScan } from "../service/api.service";
import { toast } from 'react-hot-toast';
import { csvToJson } from "../lib/csvToJson";

// Définition de l'interface pour un résultat de scan (finding)
interface Finding {
  id: string;
  chapter: string;
  section?: string;
  description: string;
  url?: string;
}

// Définition de l'interface pour la réponse du scan
interface ScanResponse {
  data: {
    url: string;
    timestamp: string;
    findings: Finding[];
  }
}

// Interface pour les données ASVS
interface ASVSData {
  chapter_id: string;
  chapter_name: string;
  section_id: string;
  section_name: string;
  req_id: string;
  req_description: string;
  level1: string;
  level2: string;
  level3: string;
  cwe: string;
  nist?: string;
}

const Home = () => {
  // State pour stocker la liste des tests (résultats)
  const [tests, setTests] = useState<Array<{
    id: string;
    name: string;
    description: string;
    status: "pending" | "running" | "completed" | "failed";
    url?: string;
    section?: string;
  }>>([]);

  const [asvsData, setAsvsData] = useState<ASVSData[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  

  useEffect(() => {
    const loadCsvData = async () => {
      try {
        const data = await csvToJson("/ASVS.csv");
        setAsvsData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données ASVS :", error);
      }
    };

    loadCsvData();
  }, []);

  const toggleChapter = (chapter: string) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  const groupedData = groupByChapter(asvsData);

  const [isModalOpen, setIsModalOpen] = useState(false); // État pour gérer la modale

  // Fonction pour ouvrir/fermer la modale
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  
  // State pour gérer l'état de l'analyse (scan)
  const [isScanning, setIsScanning] = useState(false);

  // Fonction appelée lors de la soumission d'une URL
  const handleUrlSubmit = async (url: string) => {
    console.log(`Analyse démarrée pour ${url}...`);
    // Réinitialisation des tests et de l'état de scan avant le début de l'analyse
    setTests([]);
    setIsScanning(false);
    
    // Affichage d'un toast de chargement
    const toastId = toast.loading(`Analyse de ${url} en cours...`, {
      position: 'bottom-center',
      style: {
        backgroundColor: '#2A2E3B',
        color: 'white',
        border: '2px solid #00FF9C'
      }
    });

    try {
      // Appel de l'API de scan
      const response = await runScan(url) as ScanResponse;
      console.log("Réponse du scanner : ", response);
      
      // Récupération des données de la réponse
      const { data } = response;
      const { findings, url: scannedUrl, timestamp } = data;
      
      // Formatage de la date du scan pour affichage
      const scanTime = new Date(timestamp).toLocaleString();
      
      // Création d'un tableau de tests à partir des findings
      const newTests = findings.map((finding) => ({
        id: finding.id,
        name: `${finding.id} - ${finding.chapter}`,
        description: finding.description,
        section: finding.section,
        url: finding.url,
        status: "pending" as const,
      }));
      
      // Si aucun finding n'est trouvé, on ajoute un test par défaut
      if (newTests.length === 0) {
        newTests.push({
          id: "0",
          name: "Scan Complete",
          description: "No vulnerabilities were found in the scan",
          section: undefined,
          url: undefined,
          status: "pending" as const,
        });
      }
      
      // Mise à jour du state avec les nouveaux tests
      setTests(newTests);
      // Passage de l'état de scan à true pour afficher les résultats
      setIsScanning(true);
      
      // Affichage d'un toast de succès avec les informations du scan
      toast.success(`Scan completed for ${scannedUrl} at ${scanTime}`, {
        position: 'bottom-center',
        id: toastId,
        style: {
          backgroundColor: '#2A2E3B',
          color: 'white',
          border: '2px solid #00FF9C'
        }
      });
    } catch (error) {
      // Gestion de l'erreur lors de l'analyse
      console.error("Erreur lors de l'analyse :", error);
      setIsScanning(false);
      // Affichage d'un toast d'erreur
      toast.error('Error: Unable to complete the scan', {
        position: 'bottom-center',
        id: toastId,
        style: {
          backgroundColor: '#2A2E3B',
          color: 'white',
          border: '2px solid #FF1F00'
        }
      });
    }
  };

  // Fonction pour basculer le statut d'un test entre "completed" et "pending"
  const handleStatusChange = (id: string, currentStatus: "pending" | "running" | "completed" | "failed") => {
    // Si le statut actuel est "completed", le passer à "pending", sinon à "completed"
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    // Mise à jour du state en modifiant uniquement le test concerné
    setTests((prevTests) =>
      prevTests.map((test) =>
        test.id === id ? { ...test, status: newStatus } : test
      )
    );
  };

  return (
    <div className="min-h-screen bg-cyber-black p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-['JetBrains_Mono']">
            PenTest Assistant
          </h1>
          <p className="text-gray-400">
            Outil d'analyse de sécurité pour pentesteurs juniors
          </p>
          <button
            onClick={toggleModal}
            className="absolute top-2 right-2 px-4 py-2 rounded bg-cyber-gray/50 hover:bg-cyber-black text-cyber-green transition ring-1 ring-cyber-green/20"
          >
            OWASP List
          </button>
        </header>
        <main className="space-y-2">
          {/* Composant pour saisir l'URL */}
          <UrlInput onSubmit={handleUrlSubmit} />
          {/* Affichage de la liste des tests si au moins un test existe */}
          {tests.length > 0 && (
            <div className="overflow-y-auto pb-16 scrollbar-hide" style={{ height: 'calc(100vh - 200px)'}}>
              {/* Passage du callback pour la modification du statut */}
              <TestList tests={tests} onStatusChange={handleStatusChange} />
            </div>
          )}
        </main>
      </div>
      {isModalOpen && (
        <div className="fixed top-0 right-0 h-full w-80 bg-cyber-gray text-white shadow-lg z-50 transform transition-transform duration-300">
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h2 className="text-lg font-bold">OWASP List</h2>
            <button
              onClick={toggleModal}
              className="text-cyber-green hover:text-cyber-green/20 transition"
            >
              ✕
            </button>
          </div>
          <div className="p-4 overflow-y-auto h-[calc(100%-64px)] scrollbar-hide">
            {Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([chapterName, items]) => (
                <div key={chapterName} className="mb-4">
                  {/* Bouton pour afficher/masquer les sections d'un chapitre */}
                  <button
                    onClick={() => toggleChapter(chapterName)}
                    className="w-full text-left text-cyber-green font-bold bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
                  >
                    {items[0].chapter_id} - {chapterName}
                  </button>
                  {expandedChapter === chapterName && (
                    <div className="mt-2 pl-4">
                      {items.map((item, index) => (
                        <div key={index} className="mb-4">
                          <h4 className="text-gray-300 font-semibold">
                      {item.section_name} ({item.req_id})
                          </h4>
                          <p className="text-gray-400">{item.req_description}</p>
                    </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>Chargement des données...</p>
      )}
    </div>
        </div>
      )}
    </div>
  );
};

const groupByChapter = (data: ASVSData[]) => {
  return data.reduce((acc, item) => {
    if (!acc[item.chapter_name]) {
      acc[item.chapter_name] = [];
    }
    acc[item.chapter_name].push(item);
    return acc;
  }, {} as Record<string, ASVSData[]>);
};


export default Home;
